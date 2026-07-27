# GCP Dialogflow Agent
resource "google_dialogflow_agent" "saws_agent" {
  display_name = "SAWS_Assistant_${var.env}"
  default_language_code = "en"
  time_zone             = "America/New_York"
  
  tier = "TIER_STANDARD"
}

# Note: As per the implementation plan, the Intents, Slots, and Custom Logic
# will be imported/managed via the GCP Console or CLI.

