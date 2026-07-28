# ─────────────────────────────────────────────────────────────────────────────
# Notifications Module (AWS Only)
# Provisions SNS, SQS, DynamoDB, Lambda functions, EventBridge, and API Gateway
# for the SAWS notification system.
# ─────────────────────────────────────────────────────────────────────────────

locals {
  tags = {
    Project     = "SAWS"
    Module      = "notifications"
    Environment = var.environment
  }

  backend_source_dir = "${path.module}/../../../backend/notifications"
  aws_build_dir      = "${path.module}/.build/aws-src"

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
      handler = "subscriber.handler"
      env     = local.common_env
      policy_statements = [
        { actions = ["dynamodb:PutItem"], resources = [local.dynamo_arns["notifications"]] },
      ]
    }
    notificationsGetMine = {
      handler = "getMine.handler"
      env     = local.common_env
      policy_statements = [
        { actions = ["dynamodb:Query"], resources = [local.dynamo_arns["notifications"], "${local.dynamo_arns["notifications"]}/index/*"] },
      ]
    }
    notificationsReminder = {
      handler = "reminder.handler"
      env     = local.common_env
      policy_statements = [
        { actions = ["dynamodb:Scan"], resources = ["arn:aws:dynamodb:${var.aws_region}:*:table/${var.appointments_table_name}"] },
        { actions = ["sns:Publish"], resources = [aws_sns_topic.notifications.arn] },
      ]
    }
  }
}

# SNS Topic for notification fan-out
resource "aws_sns_topic" "notifications" {
  name = "saws-${var.environment}-notifications"
  tags = local.tags
}

# DynamoDB table for storing notifications
module "database" {
  source = "./modules/database"
  tags   = local.tags
}

# Build step: stages a production-only copy of the Lambda source
resource "null_resource" "build_aws_lambdas" {
  triggers = {
    source_hash = local.aws_source_hash
  }

  provisioner "local-exec" {
    command = "node ${path.module}/scripts/build-node-package.js"
    environment = {
      SOURCE_DIR = local.backend_source_dir
      BUILD_DIR  = local.aws_build_dir
    }
  }
}

# Lambda functions: SQS subscriber, GET /notifications/me, and scheduled reminders
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

# SQS queues, EventBridge schedule, API Gateway for notifications
module "notifications_infra" {
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
