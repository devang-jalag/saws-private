# DynamoDB Tables

resource "aws_dynamodb_table" "services" {
  name           = "HealthcareServices-${var.env}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "srv_id"

  attribute {
    name = "srv_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "doctors" {
  name           = "Doctors-${var.env}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "doc_id"

  attribute {
    name = "doc_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "appointments" {
  name           = "Appointments-${var.env}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "appt_id"

  attribute {
    name = "appt_id"
    type = "S"
  }

  attribute {
    name = "usr_id"
    type = "S"
  }

  global_secondary_index {
    name               = "usr_id_index"
    hash_key           = "usr_id"
    projection_type    = "ALL"
  }
}

# IAM Role for Lambdas

resource "aws_iam_role" "lambda_exec" {
  name = "appointments_lambda_exec_role_${var.env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "lambda_dynamodb" {
  name = "appointments_dynamodb_policy_${var.env}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ]
      Effect   = "Allow"
      Resource = [
        aws_dynamodb_table.services.arn,
        aws_dynamodb_table.doctors.arn,
        aws_dynamodb_table.appointments.arn,
        "${aws_dynamodb_table.appointments.arn}/index/usr_id_index"
      ]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_attach" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_dynamodb.arn
}

resource "aws_iam_role_policy_attachment" "lambda_basic_exec" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# CloudWatch Logs policy for debugging
resource "aws_iam_role_policy_attachment" "lambda_cloudwatch" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

# Lambda Functions

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/appointments"
  output_path = "${path.module}/lambda.zip"
  excludes    = ["test_appointments.py"]
}

resource "aws_lambda_function" "services_api" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "saws-services-api-${var.env}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "api.services.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.10"

  environment {
    variables = {
      SERVICES_TABLE_NAME = aws_dynamodb_table.services.name
    }
  }
}

resource "aws_lambda_function" "doctors_api" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "saws-doctors-api-${var.env}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "api.doctors.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.10"

  environment {
    variables = {
      DOCTORS_TABLE_NAME = aws_dynamodb_table.doctors.name
    }
  }
}

resource "aws_lambda_function" "appointments_api" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "saws-appointments-api-${var.env}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "api.appointments.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.10"

  environment {
    variables = {
      APPOINTMENTS_TABLE_NAME = aws_dynamodb_table.appointments.name
    }
  }
}
