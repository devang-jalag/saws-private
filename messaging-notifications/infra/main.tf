locals {
  tags = {
    Project     = "SAWS"
    Module      = "messaging-notifications"
    Environment = var.environment
  }

  backend_source_dir = "${path.module}/../aws"
  aws_build_dir       = "${path.module}/.build/aws-src"

  # Rebuild only when the Lambda source or its locked dependencies actually change, not on
  # every apply - filesha1/fileset read the local filesystem directly, no resource needed.
  aws_source_hash = sha1(join("", [
    for f in sort(fileset(local.backend_source_dir, "**")) :
    filesha1("${local.backend_source_dir}/${f}")
    if !startswith(f, "node_modules/") && !startswith(f, "scripts/") && !endswith(f, ".test.js")
  ]))

  common_env = {
    NOTIFICATIONS_TABLE     = module.database.table_names["notifications"]
    USERS_TABLE             = var.users_table_name
    APPOINTMENTS_TABLE      = var.appointments_table_name
    NOTIFICATIONS_TOPIC_ARN = aws_sns_topic.notifications.arn
  }

  dynamo_arns = module.database.table_arns

  lambda_functions = {
    notificationsSubscriber = {
      handler = "notifications/subscriber.handler"
      env     = local.common_env
      policy_statements = [
        { actions = ["dynamodb:PutItem"], resources = [local.dynamo_arns["notifications"]] },
      ]
    }
    notificationsGetMine = {
      handler = "notifications/getMine.handler"
      env     = local.common_env
      policy_statements = [
        { actions = ["dynamodb:Query"], resources = [local.dynamo_arns["notifications"], "${local.dynamo_arns["notifications"]}/index/*"] },
      ]
    }
    notificationsReminder = {
      handler = "notifications/reminder.handler"
      env     = local.common_env
      policy_statements = [
        # Appointments table is owned by the Appointments module; this is a cross-module
        # read-only Scan, not full access to that table.
        { actions = ["dynamodb:Scan"], resources = ["arn:aws:dynamodb:${var.aws_region}:*:table/${var.appointments_table_name}"] },
        { actions = ["sns:Publish"], resources = [aws_sns_topic.notifications.arn] },
      ]
    }
  }
}

# Created at root (not inside modules/notifications) so its ARN can flow into the Lambda
# environment variables without a lambda <-> notifications-module dependency cycle: the
# Lambdas need the topic ARN as an env var, and the notifications module needs the
# Lambdas' ARNs/names for its SQS event-source-mapping and EventBridge target.
resource "aws_sns_topic" "notifications" {
  name = "saws-${var.environment}-notifications"
  tags = local.tags
}

module "database" {
  source = "./modules/database"
  tags   = local.tags
}

# Stages a production-only copy of aws/ (source + a clean `npm ci --omit=dev` node_modules)
# once, so all three Lambdas zip from the same clean build instead of each running their
# own npm ci in parallel against the same directory (which would race). Requires Node.js +
# npm on whatever machine runs `terraform apply` - no other manual step.
resource "null_resource" "build_aws_lambdas" {
  triggers = {
    source_hash = local.aws_source_hash
  }

  provisioner "local-exec" {
    command = "node \"${path.module}/scripts/build-node-package.js\" \"${local.backend_source_dir}\" \"${local.aws_build_dir}\""
  }
}

# The three Lambdas this module owns: the SQS-triggered fan-out subscriber, the reader
# behind GET /notifications/me, and the scheduled appointment-reminder job.
module "lambda" {
  source   = "./modules/compute"
  for_each = local.lambda_functions

  function_name         = each.key
  source_dir            = local.aws_build_dir
  handler               = each.value.handler
  environment_variables = each.value.env
  policy_statements     = each.value.policy_statements
  existing_role_arn     = var.existing_lambda_role_arn
  tags                  = local.tags

  depends_on = [null_resource.build_aws_lambdas]
}

module "notifications" {
  source = "./modules/notifications"

  environment = var.environment
  topic_arn   = aws_sns_topic.notifications.arn

  subscriber_lambda_arn = module.lambda["notificationsSubscriber"].function_arn
  subscriber_role_name  = module.lambda["notificationsSubscriber"].role_name

  reminder_lambda_arn  = module.lambda["notificationsReminder"].function_arn
  reminder_lambda_name = module.lambda["notificationsReminder"].function_name

  get_mine_lambda_invoke_arn = module.lambda["notificationsGetMine"].invoke_arn
  get_mine_lambda_name       = module.lambda["notificationsGetMine"].function_name

  aws_region          = var.aws_region
  user_pool_id        = var.user_pool_id
  user_pool_client_id = var.user_pool_client_id

  tags = local.tags
}

module "gcp_messaging" {
  source = "./modules/gcp-messaging"

  environment             = var.environment
  gcp_project_id          = var.gcp_project_id
  gcp_region              = var.gcp_region
  source_dir              = "${path.module}/../gcp"
  aws_region              = var.aws_region
  user_pool_id            = var.user_pool_id
  notifications_topic_arn = aws_sns_topic.notifications.arn
  users_table_name        = var.users_table_name
  aws_access_key_id       = var.gcp_functions_aws_access_key_id
  aws_secret_access_key   = var.gcp_functions_aws_secret_access_key
  tags                    = local.tags
}
