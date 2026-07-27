output "analytics_url" {
  description = "The public URL of the analytics API service"
  value       = google_cloud_run_v2_service.analytics.uri
}
