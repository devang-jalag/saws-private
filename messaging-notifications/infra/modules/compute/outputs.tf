output "function_name" {
  value = aws_lambda_function.this.function_name
}

output "function_arn" {
  value = aws_lambda_function.this.arn
}

output "invoke_arn" {
  value = aws_lambda_function.this.invoke_arn
}

output "role_arn" {
  value = local.using_existing_role ? var.existing_role_arn : aws_iam_role.this[0].arn
}

# Empty when using_existing_role: callers use this to decide whether they can safely
# attach an extra inline policy (we don't own/manage a pre-existing role like LabRole).
output "role_name" {
  value = local.using_existing_role ? "" : aws_iam_role.this[0].name
}
