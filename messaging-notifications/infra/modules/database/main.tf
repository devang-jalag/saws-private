# Only the tables the Notifications module owns. Users/Appointments/Services/Feedback
# live in the Auth/Appointments/Feedback teammates' own Terraform - this module reads them
# by name (see var.users_table_name / var.appointments_table_name in the root module),
# not by creating them here.
resource "aws_dynamodb_table" "notifications" {
  name         = "saws-notifications"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "notificationId"

  attribute {
    name = "notificationId"
    type = "S"
  }
  attribute {
    name = "userId"
    type = "S"
  }
  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "userId-createdAt-index"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  tags = var.tags
}
