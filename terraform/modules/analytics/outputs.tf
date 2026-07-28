output "analytics_url" {
  description = "The public URL of the analytics API Cloud Run service"
  value       = google_cloud_run_v2_service.analytics.uri
}

output "bigquery_dataset_id" {
  description = "BigQuery dataset ID for Looker Studio connection"
  value       = google_bigquery_dataset.saws_analytics.dataset_id
}

output "bigquery_feedback_table" {
  description = "BigQuery feedback_sentiment table ID"
  value       = google_bigquery_table.feedback_sentiment.table_id
}

output "bigquery_appointment_table" {
  description = "BigQuery appointment_analytics table ID"
  value       = google_bigquery_table.appointment_analytics.table_id
}

output "looker_studio_url" {
  description = "Direct link to create a Looker Studio report connected to the SAWS BigQuery dataset"
  value       = "https://lookerstudio.google.com/reporting/create?c.reportId=&ds.connector=BIG_QUERY&ds.projectId=${var.project_id}&ds.datasetId=${google_bigquery_dataset.saws_analytics.dataset_id}&ds.tableId=${google_bigquery_table.feedback_sentiment.table_id}"
}
