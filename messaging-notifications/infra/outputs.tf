output "notifications_topic_arn" {
  value = aws_sns_topic.notifications.arn
}

output "notifications_api_endpoint" {
  value = module.notifications.api_endpoint
}

output "messaging_submit_concern_url" {
  value = module.gcp_messaging.submit_concern_url
}

output "messaging_respond_to_concern_url" {
  value = module.gcp_messaging.respond_to_concern_url
}

output "messaging_list_concerns_url" {
  value = module.gcp_messaging.list_concerns_url
}
