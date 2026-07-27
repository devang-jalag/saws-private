terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  # GitLab's built-in Terraform-state HTTP backend - no separate S3/GCS bucket to bootstrap.
  # Address/credentials are supplied via -backend-config at init time (see .gitlab-ci.yml
  # for CI, or the "local deploys" section of messaging-notifications/README.md for
  # running this by hand), never hardcoded here.
  backend "http" {}
}

provider "aws" {
  region = var.aws_region
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
