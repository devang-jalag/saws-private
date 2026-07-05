variable "environment" {
  type = string
}

variable "topic_arn" {
  description = "ARN of the SNS notifications topic, created in the root module so its ARN can be handed to Lambdas as an env var without a lambda<->notifications dependency cycle."
  type        = string
}

variable "subscriber_lambda_arn" {
  type = string
}

variable "subscriber_role_name" {
  type = string
}

variable "reminder_lambda_arn" {
  type = string
}

variable "reminder_lambda_name" {
  type = string
}

variable "reminder_schedule_expression" {
  type    = string
  default = "rate(1 hour)"
}

variable "get_mine_lambda_invoke_arn" {
  description = "Invoke ARN of the GET /notifications/me Lambda."
  type        = string
}

variable "get_mine_lambda_name" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "user_pool_id" {
  description = "Cognito user pool id, owned by the Auth module - passed in by name, not created here."
  type        = string
}

variable "user_pool_client_id" {
  type = string
}

variable "cors_allow_origins" {
  type    = list(string)
  default = ["*"]
}

variable "tags" {
  type    = map(string)
  default = {}
}
