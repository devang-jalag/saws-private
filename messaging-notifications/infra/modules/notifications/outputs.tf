output "queue_arn" {
  value = aws_sqs_queue.notifications.arn
}

output "api_endpoint" {
  value = aws_apigatewayv2_stage.default.invoke_url
}
