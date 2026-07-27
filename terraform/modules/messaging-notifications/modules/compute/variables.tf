variable "function_name" {
  type = string
}

variable "source_dir" {
  description = "Path to the backend/aws directory (zipped as a whole so shared/ is always included)."
  type        = string
}

variable "handler" {
  description = "e.g. auth/register.handler"
  type        = string
}

variable "runtime" {
  type    = string
  default = "nodejs20.x"
}

variable "timeout" {
  type    = number
  default = 10
}

variable "memory_size" {
  type    = number
  default = 256
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}

variable "policy_statements" {
  description = "Extra IAM statements this function's execution role needs, as a list of {actions, resources}. Ignored when existing_role_arn is set, since we then don't manage that role's policies."
  type = list(object({
    actions   = list(string)
    resources = list(string)
  }))
  default = []
}

variable "existing_role_arn" {
  description = "Use a pre-existing IAM role (e.g. AWS Academy Learner Lab's LabRole) instead of creating one. Learner Lab sandboxes typically block iam:CreateRole/PutRolePolicy entirely, so leave this empty for a normal account and set it to the lab role's ARN when deploying under a restricted one."
  type        = string
  default     = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}
