output "sns_topic_arn" {
  description = "ARN of the notifications SNS topic"
  value       = aws_sns_topic.notifications.arn
}

output "notifications_api_url" {
  description = "Base URL of the Notifications HTTP API Gateway"
  value       = module.notifications_infra.api_endpoint
}
