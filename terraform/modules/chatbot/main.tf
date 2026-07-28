# GCP Dialogflow Agent
resource "google_dialogflow_agent" "saws_agent" {
  display_name = "SAWS_Assistant_${var.env}"
  default_language_code = "en"
  time_zone             = "America/New_York"
  
  tier = "TIER_STANDARD"
}

# Note: As per the implementation plan, the Intents, Slots, and Custom Logic
# will be imported/managed via the GCP Console or CLI.


# Storage bucket for the Cloud Function source code
resource "google_storage_bucket" "webhook_source" {
  name     = "saws-chatbot-webhook-${var.gcp_project_id}"
  location = "us-central1"
}

# Zip the webhook source code
data "archive_file" "webhook_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/chatbot-webhook"
  output_path = "${path.module}/.build/webhook.zip"
}

# Upload the zip to the bucket
resource "google_storage_bucket_object" "webhook_archive" {
  name   = "webhook-${data.archive_file.webhook_zip.output_md5}.zip"
  bucket = google_storage_bucket.webhook_source.name
  source = data.archive_file.webhook_zip.output_path
}

# Cloud Function (v2) for Chatbot Webhook
resource "google_cloudfunctions2_function" "chatbot_webhook" {
  name        = "saws-chatbot-webhook"
  location    = "us-central1"
  description = "Dialogflow fulfillment webhook for SAWS"

  build_config {
    runtime     = "nodejs20"
    entry_point = "dialogflowWebhook"
    source {
      storage_source {
        bucket = google_storage_bucket.webhook_source.name
        object = google_storage_bucket_object.webhook_archive.name
      }
    }
  }

  service_config {
    max_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60
  }
}

# Allow public unauthenticated access to the webhook (so Dialogflow can hit it)
resource "google_cloud_run_service_iam_member" "webhook_public" {
  location = google_cloudfunctions2_function.chatbot_webhook.location
  project  = google_cloudfunctions2_function.chatbot_webhook.project
  service  = google_cloudfunctions2_function.chatbot_webhook.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Firestore Database (If it already exists, Terraform might conflict, but requested by user)
resource "google_firestore_database" "database" {
  project     = var.gcp_project_id
  name        = "(default)"
  location_id = "nam5"
  type        = "FIRESTORE_NATIVE"
  
  # Firestore databases are tricky to manage via Terraform if already created via console
  # This serves to explicitly declare the integration as requested.
}

