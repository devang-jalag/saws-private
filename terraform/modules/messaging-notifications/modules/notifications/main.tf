resource "aws_sqs_queue" "notifications_dlq" {
  name = "saws-${var.environment}-notifications-dlq"
  tags = var.tags
}

resource "aws_sqs_queue" "notifications" {
  name = "saws-${var.environment}-notifications"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notifications_dlq.arn
    maxReceiveCount     = 5
  })

  tags = var.tags
}

resource "aws_sqs_queue_policy" "allow_sns" {
  queue_url = aws_sqs_queue.notifications.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "sns.amazonaws.com" }
      Action    = "sqs:SendMessage"
      Resource  = aws_sqs_queue.notifications.arn
      Condition = { ArnEquals = { "aws:SourceArn" = var.topic_arn } }
    }]
  })
}

resource "aws_sns_topic_subscription" "queue" {
  topic_arn = var.topic_arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.notifications.arn
}

resource "aws_lambda_event_source_mapping" "subscriber" {
  event_source_arn = aws_sqs_queue.notifications.arn
  function_name    = var.subscriber_lambda_arn
  batch_size       = 10
}

# Skipped when subscriber_role_name is empty - that means the Lambda is using a
# pre-existing role (e.g. Learner Lab's LabRole) we don't own and can't/shouldn't attach
# extra inline policies to. LabRole's own broad permissions are expected to cover this.
resource "aws_iam_role_policy" "subscriber_sqs_access" {
  count = var.subscriber_role_name != "" ? 1 : 0
  name  = "saws-${var.environment}-notifications-subscriber-sqs"
  role  = var.subscriber_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
      Resource = aws_sqs_queue.notifications.arn
    }]
  })
}

resource "aws_cloudwatch_event_rule" "reminder_schedule" {
  name                = "saws-${var.environment}-appointment-reminders"
  schedule_expression = var.reminder_schedule_expression
  tags                = var.tags
}

resource "aws_cloudwatch_event_target" "reminder_lambda" {
  rule = aws_cloudwatch_event_rule.reminder_schedule.name
  arn  = var.reminder_lambda_arn
}

resource "aws_lambda_permission" "allow_events_bridge" {
  statement_id  = "AllowEventBridgeInvokeReminder"
  action        = "lambda:InvokeFunction"
  function_name = var.reminder_lambda_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.reminder_schedule.arn
}

# This module owns its one HTTP route (GET /notifications/me) instead of registering into a
# shared cross-module API Gateway, so it stays deployable on its own. It only needs the
# Cognito user pool id/client id from the Auth module to validate tokens - it doesn't need
# that module's Terraform to exist.
resource "aws_apigatewayv2_api" "this" {
  name          = "saws-${var.environment}-notifications-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.cors_allow_origins
    allow_methods = ["GET", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
  }

  tags = var.tags
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true
  tags        = var.tags
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.this.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "saws-${var.environment}-notifications-cognito-authorizer"

  jwt_configuration {
    audience = [var.user_pool_client_id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.user_pool_id}"
  }
}

resource "aws_apigatewayv2_integration" "get_mine" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.get_mine_lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_mine" {
  api_id             = aws_apigatewayv2_api.this.id
  route_key          = "GET /notifications/me"
  target             = "integrations/${aws_apigatewayv2_integration.get_mine.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowApiGatewayInvokeGetMine"
  action        = "lambda:InvokeFunction"
  function_name = var.get_mine_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}
