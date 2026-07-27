output "table_names" {
  value = {
    notifications = aws_dynamodb_table.notifications.name
  }
}

output "table_arns" {
  value = {
    notifications = aws_dynamodb_table.notifications.arn
  }
}
