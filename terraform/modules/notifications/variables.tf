# ─────────────────────────────────────────────────────────────────────────────
# Notifications Module Variables (AWS Only)
# ─────────────────────────────────────────────────────────────────────────────

variable "environment" {
  description = "Deployment environment name (e.g. dev, prod)."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

# --- Cross-module integration points ---
variable "user_pool_id" {
  description = "Cognito user pool id from the Auth module."
  type        = string
}

variable "user_pool_client_id" {
  description = "Cognito user pool client id from the Auth module."
  type        = string
}

variable "users_table_name" {
  description = "Name of the Auth module's Users DynamoDB table."
  type        = string
  default     = "saws-users"
}

variable "appointments_table_name" {
  description = "Name of the Appointments module's DynamoDB table."
  type        = string
  default     = "saws-appointments"
}

variable "existing_lambda_role_arn" {
  description = "Pre-existing IAM role ARN (e.g. LabRole) for Lambdas. Leave empty for normal AWS accounts."
  type        = string
  default     = ""
}
