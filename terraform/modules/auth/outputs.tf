output "user_pool_id" {
  description = "The ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.auth.id
}

output "user_pool_client_id" {
  description = "The ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.auth_client.id
}

output "users_table_name" {
  description = "The name of the DynamoDB users table"
  value       = aws_dynamodb_table.users.name
}

output "login_lambda_function_name" {
  description = "The name of the login wrapper Lambda function"
  value       = aws_lambda_function.login_wrapper.function_name
}

output "signup_lambda_function_name" {
  description = "The name of the signup Lambda function"
  value       = aws_lambda_function.signup.function_name
}
