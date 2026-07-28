# ─────────────────────────────────────────────────────────────────────────────
# Chatbot Module (GCP)
# Provisions:
#   - Dialogflow Agent
#   - Cloud Function v2 webhook for fulfillment
#   - Firestore Database for conversation context
#   - Auto-enables all required GCP APIs
# ─────────────────────────────────────────────────────────────────────────────

# ── Enable required GCP APIs ────────────────────────────────────────────────
locals {
  required_apis = [
    "dialogflow.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "artifactregistry.googleapis.com",
  ]
}

resource "google_project_service" "required" {
  for_each = toset(local.required_apis)

  project            = var.gcp_project_id
  service            = each.value
  disable_on_destroy = false
}

# ── Dialogflow Agent ────────────────────────────────────────────────────────
resource "google_dialogflow_agent" "saws_agent" {
  display_name          = "SAWS_Assistant_${var.env}"
  default_language_code = "en"
  time_zone             = "America/New_York"
  tier                  = "TIER_STANDARD"

  depends_on = [google_project_service.required]
}

# ── Firestore Database for conversation context ────────────────────────────
resource "google_firestore_database" "chatbot_db" {
  project     = var.gcp_project_id
  name        = "(default)"
  location_id = "nam5"
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.required]
}

# ── Cloud Function v2: Dialogflow Fulfillment Webhook ───────────────────────
resource "google_storage_bucket" "webhook_source" {
  name     = "saws-chatbot-webhook-${var.gcp_project_id}"
  location = "us-central1"

  depends_on = [google_project_service.required]
}

data "archive_file" "webhook_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/chatbot-webhook"
  output_path = "${path.module}/.build/webhook.zip"
}

resource "google_storage_bucket_object" "webhook_archive" {
  name   = "webhook-${data.archive_file.webhook_zip.output_md5}.zip"
  bucket = google_storage_bucket.webhook_source.name
  source = data.archive_file.webhook_zip.output_path
}

resource "google_cloudfunctions2_function" "chatbot_webhook" {
  name        = "saws-chatbot-webhook"
  location    = "us-central1"
  description = "Dialogflow fulfillment webhook — reads/writes Firestore for conversation context"

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

  depends_on = [google_project_service.required]
}

# Allow Dialogflow to invoke the webhook without authentication
resource "google_cloud_run_service_iam_member" "webhook_public" {
  location = google_cloudfunctions2_function.chatbot_webhook.location
  project  = google_cloudfunctions2_function.chatbot_webhook.project
  service  = google_cloudfunctions2_function.chatbot_webhook.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
