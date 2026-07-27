variable "environment" {
  description = "Deployment environment name (e.g. dev, sprint2, prod)."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "gcp_project_id" {
  description = "GCP project hosting the Messaging module (Pub/Sub, Cloud Functions, Firestore)."
  type        = string
}

variable "gcp_region" {
  type    = string
  default = "us-central1"
}

# --- Cross-module integration points ---------------------------------------------------
# This service (Messaging + Notifications) doesn't own Auth, Appointments, or Users - it
# only needs to know the names/ids of resources those teammates' modules create.

variable "user_pool_id" {
  description = "Cognito user pool id from the Auth module, used to verify JWTs on both the AWS notifications API and the GCP messaging Cloud Functions."
  type        = string
}

variable "user_pool_client_id" {
  description = "Cognito user pool client id from the Auth module."
  type        = string
}

variable "users_table_name" {
  description = "Name of the Auth module's Users table (read-only, used to pick a random active coordinator)."
  type        = string
  default     = "saws-users"
}

variable "appointments_table_name" {
  description = "Name of the Appointments module's table (read-only, used to find appointments due a reminder)."
  type        = string
  default     = "saws-appointments"
}

variable "gcp_functions_aws_access_key_id" {
  description = "IAM access key for the cross-cloud AWS SDK calls made from GCP Cloud Functions (read Users table, publish notifications). Prefer a Secret Manager reference over a plain tfvars value."
  type        = string
  sensitive   = true
}

variable "gcp_functions_aws_secret_access_key" {
  type      = string
  sensitive = true
}

variable "gcp_functions_aws_session_token" {
  description = "Required when the access key/secret above are temporary STS credentials (e.g. AWS Academy Learner Lab always issues these) - leave empty for a long-lived IAM user's keys."
  type        = string
  sensitive   = true
  default     = ""
}

variable "existing_lambda_role_arn" {
  description = "Use a pre-existing IAM role (e.g. AWS Academy Learner Lab's LabRole) for every Lambda instead of creating one per function. Learner Lab sandboxes typically block iam:CreateRole/PutRolePolicy - leave empty for a normal AWS account, set to the lab role's ARN (find it with `aws iam list-roles` or the Learner Lab \"AWS Details\" panel) when deploying under a restricted one."
  type        = string
  default     = ""
}
