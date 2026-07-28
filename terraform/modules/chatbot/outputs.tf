output "dialogflow_agent_id" {
  description = "The ID of the GCP Dialogflow Agent"
  value       = google_dialogflow_agent.saws_agent.id
}

output "chatbot_webhook_url" {
  description = "The URL of the Chatbot fulfillment webhook"
  value       = google_cloudfunctions2_function.chatbot_webhook.service_config[0].uri
}

