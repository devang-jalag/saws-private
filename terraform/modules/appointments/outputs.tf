output "services_table_name" {
  value = aws_dynamodb_table.services.name
}

output "doctors_table_name" {
  value = aws_dynamodb_table.doctors.name
}

output "appointments_table_name" {
  value = aws_dynamodb_table.appointments.name
}

output "services_lambda_arn" {
  value = aws_lambda_function.services_api.arn
}

output "doctors_lambda_arn" {
  value = aws_lambda_function.doctors_api.arn
}

output "appointments_lambda_arn" {
  value = aws_lambda_function.appointments_api.arn
}
