output "dialogflow_agent_id" {
  description = "The ID of the GCP Dialogflow Agent"
  value       = google_dialogflow_agent.saws_agent.id
}
