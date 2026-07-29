variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP Region"
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "The name of the Cloud Run service"
  type        = string
  default     = "saws-frontend"
}

variable "image_name" {
  description = "The Docker image for the frontend"
  type        = string
  default     = ""
}

