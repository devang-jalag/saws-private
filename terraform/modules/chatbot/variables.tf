variable "env" {
  description = "Environment name (e.g. dev, prod)"
  type        = string
  default     = "dev"
}

variable "gcp_project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "appointments_table_name" {
  description = "Name of the DynamoDB Appointments table"
  type        = string
}
