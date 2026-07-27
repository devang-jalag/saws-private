resource "google_cloud_run_v2_service" "analytics" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    containers {
      image = var.image_name

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }
    }
  }
}

# Make the Cloud Run service publicly accessible
resource "google_cloud_run_service_iam_member" "public" {
  location = google_cloud_run_v2_service.analytics.location
  project  = google_cloud_run_v2_service.analytics.project
  service  = google_cloud_run_v2_service.analytics.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
