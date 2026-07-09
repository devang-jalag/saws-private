output "frontend_url" {
  description = "The public URL of the frontend service"
  value       = google_cloud_run_v2_service.frontend.uri
}
