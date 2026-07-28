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
}

# Make the Cloud Run service publicly accessible
resource "google_cloud_run_service_iam_member" "public" {
  location = google_cloud_run_v2_service.analytics.location
  project  = google_cloud_run_v2_service.analytics.project
  service  = google_cloud_run_v2_service.analytics.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# BigQuery Dataset for SAWS Analytics
resource "google_bigquery_dataset" "saws_analytics" {
  dataset_id                  = "saws_analytics_${var.environment}"
  friendly_name               = "SAWS Analytics"
  description                 = "Dataset for SAWS analytics and Looker Studio"
  location                    = "US"
  project                     = var.project_id
  delete_contents_on_destroy  = true
}

# BigQuery Table for Feedback and Sentiment
resource "google_bigquery_table" "feedback_sentiment" {
  dataset_id = google_bigquery_dataset.saws_analytics.dataset_id
  table_id   = "feedback_sentiment"
  project    = var.project_id

  schema = <<EOF
[
  {
    "name": "feedbackId",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "Unique Feedback ID"
  },
  {
    "name": "patientId",
    "type": "STRING",
    "mode": "REQUIRED"
  },
  {
    "name": "serviceId",
    "type": "STRING",
    "mode": "REQUIRED"
  },
  {
    "name": "rating",
    "type": "INTEGER",
    "mode": "REQUIRED"
  },
  {
    "name": "comment",
    "type": "STRING",
    "mode": "NULLABLE"
  },
  {
    "name": "submittedAt",
    "type": "TIMESTAMP",
    "mode": "REQUIRED"
  },
  {
    "name": "sentimentLabel",
    "type": "STRING",
    "mode": "REQUIRED"
  },
  {
    "name": "sentimentScore",
    "type": "FLOAT",
    "mode": "REQUIRED"
  }
]
EOF
}

