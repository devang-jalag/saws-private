terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Create an Artifact Registry repository for the frontend image
resource "google_artifact_registry_repository" "frontend_repo" {
  provider      = google
  location      = var.region
  repository_id = "saws-frontend-repo"
  description   = "Docker repository for SAWS frontend"
  format        = "DOCKER"
  project       = var.project_id
}

# Define the Cloud Run service for the frontend
resource "google_cloud_run_v2_service" "frontend" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    containers {
      # Use the provided image, or a fallback placeholder to allow initial apply
      image = var.image_name != "" ? var.image_name : "us-docker.pkg.dev/cloudrun/container/hello"

      ports {
        container_port = 80
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }
    }
  }

  depends_on = [google_artifact_registry_repository.frontend_repo]
}

# Make the Cloud Run service public
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.frontend.location
  project  = google_cloud_run_v2_service.frontend.project
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

