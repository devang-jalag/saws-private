output "submit_concern_url" {
  value = google_cloudfunctions2_function.submit_concern.url
}

output "respond_to_concern_url" {
  value = google_cloudfunctions2_function.respond_to_concern.url
}

output "list_concerns_url" {
  value = google_cloudfunctions2_function.list_concerns.url
}
