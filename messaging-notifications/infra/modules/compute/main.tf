# var.source_dir is expected to already be a clean, production-only build (see the root
# module's null_resource.build_aws_lambdas) - node_modules is intentionally NOT excluded
# here, unlike the GCP archive, because Lambda has no build step of its own to install it.
data "archive_file" "this" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/../../.build/${var.function_name}.zip"
  excludes    = ["**/*.test.js"]
}

locals {
  using_existing_role = var.existing_role_arn != ""
}

resource "aws_iam_role" "this" {
  count = local.using_existing_role ? 0 : 1
  name  = "saws-${var.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "basic_execution" {
  count      = local.using_existing_role ? 0 : 1
  role       = aws_iam_role.this[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "extra" {
  count = !local.using_existing_role && length(var.policy_statements) > 0 ? 1 : 0
  name  = "saws-${var.function_name}-policy"
  role  = aws_iam_role.this[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      for s in var.policy_statements : {
        Effect   = "Allow"
        Action   = s.actions
        Resource = s.resources
      }
    ]
  })
}

resource "aws_lambda_function" "this" {
  function_name    = "saws-${var.function_name}"
  filename         = data.archive_file.this.output_path
  source_code_hash = data.archive_file.this.output_base64sha256
  handler          = var.handler
  runtime          = var.runtime
  role             = local.using_existing_role ? var.existing_role_arn : aws_iam_role.this[0].arn
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = var.environment_variables
  }

  tags = var.tags
}
