# ─────────────────────────────────────────────────────────────────────────────
# Analytics Module (GCP)
# Provisions:
#   - BigQuery Dataset + Table for analytics data (Looker Studio data source)
#   - Cloud Run service for the analytics API
#   - Auto-enables Natural Language API and BigQuery API
#   - Looker Studio report link output (connects to BigQuery)
# ─────────────────────────────────────────────────────────────────────────────

# ── Enable required GCP APIs ────────────────────────────────────────────────
locals {
  required_apis = [
    "bigquery.googleapis.com",
    "language.googleapis.com",
    "run.googleapis.com",
  ]
}

resource "google_project_service" "required" {
  for_each = toset(local.required_apis)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# ── Cloud Run: Analytics API ────────────────────────────────────────────────
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
          memory = "512Mi"
        }
      }
    }
  }

  depends_on = [google_project_service.required]
}

resource "google_cloud_run_service_iam_member" "public" {
  location = google_cloud_run_v2_service.analytics.location
  project  = google_cloud_run_v2_service.analytics.project
  service  = google_cloud_run_v2_service.analytics.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ── BigQuery: Analytics Dataset for Looker Studio ───────────────────────────
resource "google_bigquery_dataset" "saws_analytics" {
  dataset_id                 = "saws_analytics_${var.environment}"
  friendly_name              = "SAWS Analytics"
  description                = "Central analytics dataset for SAWS — connects directly to Looker Studio for dashboards and reporting."
  location                   = "US"
  project                    = var.project_id
  delete_contents_on_destroy = true

  # Grant Looker Studio (and any authenticated user) read access so dashboards work
  access {
    role          = "READER"
    special_group = "projectReaders"
  }
  access {
    role          = "WRITER"
    special_group = "projectWriters"
  }
  access {
    role          = "OWNER"
    special_group = "projectOwners"
  }

  depends_on = [google_project_service.required]
}

# Feedback + Sentiment table — Looker Studio reads from this
resource "google_bigquery_table" "feedback_sentiment" {
  dataset_id          = google_bigquery_dataset.saws_analytics.dataset_id
  table_id            = "feedback_sentiment"
  project             = var.project_id
  deletion_protection = false

  schema = jsonencode([
    {
      name        = "feedbackId"
      type        = "STRING"
      mode        = "REQUIRED"
      description = "Unique feedback identifier"
    },
    {
      name = "patientId"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "serviceId"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "rating"
      type = "INTEGER"
      mode = "REQUIRED"
    },
    {
      name = "comment"
      type = "STRING"
      mode = "NULLABLE"
    },
    {
      name = "submittedAt"
      type = "TIMESTAMP"
      mode = "REQUIRED"
    },
    {
      name        = "sentimentLabel"
      type        = "STRING"
      mode        = "REQUIRED"
      description = "AI-detected sentiment: POSITIVE, NEGATIVE, NEUTRAL, or MIXED (from Google Natural Language API)"
    },
    {
      name        = "sentimentScore"
      type        = "FLOAT"
      mode        = "REQUIRED"
      description = "Sentiment score from -1.0 (negative) to 1.0 (positive)"
    }
  ])
}

# Appointment analytics table — aggregated appointment data for dashboards
resource "google_bigquery_table" "appointment_analytics" {
  dataset_id          = google_bigquery_dataset.saws_analytics.dataset_id
  table_id            = "appointment_analytics"
  project             = var.project_id
  deletion_protection = false

  schema = jsonencode([
    {
      name = "appointmentId"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "patientId"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "serviceId"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "appointmentDate"
      type = "DATE"
      mode = "REQUIRED"
    },
    {
      name = "status"
      type = "STRING"
      mode = "REQUIRED"
    },
    {
      name = "createdAt"
      type = "TIMESTAMP"
      mode = "REQUIRED"
    }
  ])
}
