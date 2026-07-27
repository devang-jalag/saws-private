variable "environment" {
  type = string
}

variable "gcp_project_id" {
  type = string
}

variable "gcp_region" {
  type = string
}

variable "source_dir" {
  description = "Path to backend/gcp/messaging."
  type        = string
}

variable "aws_region" {
  description = "Passed through so Cloud Functions can build the Cognito JWKS URL."
  type        = string
}

variable "user_pool_id" {
  type = string
}

variable "notifications_topic_arn" {
  description = "AWS SNS topic ARN the assignCoordinator/respondToConcern functions publish to cross-cloud."
  type        = string
}

variable "aws_access_key_id" {
  description = "Credentials for the cross-cloud AWS SDK calls (DynamoDB read + SNS publish) made from GCP Cloud Functions. Store as a Secret Manager-backed value in real deployments, not a plain tfvars file."
  type        = string
  sensitive   = true
}

variable "aws_secret_access_key" {
  type      = string
  sensitive = true
}

variable "aws_session_token" {
  description = "Required when aws_access_key_id/secret are temporary STS credentials (e.g. AWS Academy Learner Lab always issues these) - leave empty for a long-lived IAM user's keys."
  type        = string
  sensitive   = true
  default     = ""
}

variable "users_table_name" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
