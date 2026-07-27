data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# AWS Lex V2 Bot
resource "aws_lexv2models_bot" "saws_bot" {
  name                        = "SAWS_Assistant_${var.env}"
  description                 = "Virtual Assistant for SmartCare Appointment and Wellness System"
  idle_session_ttl_in_seconds = 300
  role_arn                    = data.aws_iam_role.lab_role.arn

  data_privacy {
    child_directed = false
  }
}

# Default Locale (en_US)
resource "aws_lexv2models_bot_locale" "en_us" {
  bot_id                           = aws_lexv2models_bot.saws_bot.id
  bot_version                      = "DRAFT"
  locale_id                        = "en_US"
  n_lu_intent_confidence_threshold = 0.40
  voice_settings {
    voice_id = "Ivy"
  }
}

# Note: As per the implementation plan (Option 2), the Intents, Slots, and Custom Logic
# will be imported/managed via the AWS Console or AWS CLI to avoid the extreme verbosity
# and rigidity of managing Lex V2 models in pure Terraform HCL.
