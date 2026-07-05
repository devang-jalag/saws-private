resource "google_firestore_database" "this" {
  project     = var.gcp_project_id
  name        = "(default)"
  location_id = var.gcp_region
  type        = "FIRESTORE_NATIVE"
}

resource "google_pubsub_topic" "patient_concerns" {
  name = "patient-concerns"
}

resource "google_pubsub_subscription" "assign_coordinator" {
  name  = "assign-coordinator-sub"
  topic = google_pubsub_topic.patient_concerns.name

  ack_deadline_seconds = 30

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.patient_concerns_dlq.id
    max_delivery_attempts = 5
  }
}

resource "google_pubsub_topic" "patient_concerns_dlq" {
  name = "patient-concerns-dlq"
}

resource "google_storage_bucket" "functions_source" {
  name                        = "saws-${var.environment}-messaging-functions-${var.gcp_project_id}"
  location                    = var.gcp_region
  uniform_bucket_level_access = true
}

# node_modules is deliberately excluded: Cloud Functions gen2 builds from source with
# Buildpacks, which run `npm install` from package.json/package-lock.json at deploy time
# (in a production install, so devDependencies like jest/functions-framework never ship).
# Uploading our own node_modules here would just be 80+MB of wasted, redundant transfer.
data "archive_file" "messaging_source" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/../../.build/gcp-messaging.zip"
  excludes    = ["node_modules", "scripts", "**/*.test.js"]
}

resource "google_storage_bucket_object" "messaging_source" {
  name   = "messaging-${data.archive_file.messaging_source.output_md5}.zip"
  bucket = google_storage_bucket.functions_source.name
  source = data.archive_file.messaging_source.output_path
}

locals {
  common_env = {
    AWS_REGION              = var.aws_region
    USER_POOL_ID            = var.user_pool_id
    AWS_ACCESS_KEY_ID       = var.aws_access_key_id
    AWS_SECRET_ACCESS_KEY   = var.aws_secret_access_key
    USERS_TABLE             = var.users_table_name
    NOTIFICATIONS_TOPIC_ARN = var.notifications_topic_arn
    CONCERNS_TOPIC          = google_pubsub_topic.patient_concerns.name
  }
}

resource "google_cloudfunctions2_function" "submit_concern" {
  name     = "saws-${var.environment}-submit-concern"
  location = var.gcp_region

  build_config {
    runtime     = "nodejs20"
    entry_point = "submitConcern"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_source.name
        object = google_storage_bucket_object.messaging_source.name
      }
    }
  }

  service_config {
    available_memory      = "256M"
    timeout_seconds       = 15
    environment_variables = local.common_env
  }
}

resource "google_cloudfunctions2_function" "assign_coordinator" {
  name     = "saws-${var.environment}-assign-coordinator"
  location = var.gcp_region

  build_config {
    runtime     = "nodejs20"
    entry_point = "assignCoordinator"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_source.name
        object = google_storage_bucket_object.messaging_source.name
      }
    }
  }

  service_config {
    available_memory      = "256M"
    timeout_seconds       = 30
    environment_variables = local.common_env
  }

  event_trigger {
    trigger_region = var.gcp_region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = google_pubsub_topic.patient_concerns.id
    retry_policy   = "RETRY_POLICY_RETRY"
  }
}

resource "google_cloudfunctions2_function" "respond_to_concern" {
  name     = "saws-${var.environment}-respond-to-concern"
  location = var.gcp_region

  build_config {
    runtime     = "nodejs20"
    entry_point = "respondToConcern"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_source.name
        object = google_storage_bucket_object.messaging_source.name
      }
    }
  }

  service_config {
    available_memory      = "256M"
    timeout_seconds       = 15
    environment_variables = local.common_env
  }
}

resource "google_cloudfunctions2_function" "list_concerns" {
  name     = "saws-${var.environment}-list-concerns"
  location = var.gcp_region

  build_config {
    runtime     = "nodejs20"
    entry_point = "listConcerns"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_source.name
        object = google_storage_bucket_object.messaging_source.name
      }
    }
  }

  service_config {
    available_memory      = "256M"
    timeout_seconds       = 15
    environment_variables = local.common_env
  }
}

# Auth is enforced inside each HTTP function by verifying the Cognito JWT, so the Cloud
# Run services backing these gen2 functions allow unauthenticated invocations at the
# infra layer.
resource "google_cloud_run_service_iam_member" "public_invoke" {
  for_each = toset(["submit-concern", "respond-to-concern", "list-concerns"])

  location = var.gcp_region
  project  = var.gcp_project_id
  service  = "saws-${var.environment}-${each.key}"
  role     = "roles/run.invoker"
  member   = "allUsers"

  depends_on = [
    google_cloudfunctions2_function.submit_concern,
    google_cloudfunctions2_function.respond_to_concern,
    google_cloudfunctions2_function.list_concerns,
  ]
}
