output "frontend_url" {
  description = "The URL of the deployed Cloud Run frontend service"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "artifact_repo_url" {
  description = "The Artifact Registry repository URL"
  value       = "${google_artifact_registry_repository.frontend_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.frontend_repo.repository_id}"
}

