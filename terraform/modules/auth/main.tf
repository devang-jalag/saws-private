data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# DynamoDB Table
resource "aws_dynamodb_table" "users" {
  name           = "saws-users-${var.env}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
}

# Lambdas
data "archive_file" "create_challenge_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/auth/login/create-challenge"
  output_path = "${path.module}/create-challenge.zip"
}

resource "aws_lambda_function" "create_challenge" {
  filename         = data.archive_file.create_challenge_zip.output_path
  function_name    = "saws-create-challenge-${var.env}"
  role             = data.aws_iam_role.lab_role.arn
  handler          = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.create_challenge_zip.output_base64sha256
  runtime          = "python3.10"

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

data "archive_file" "define_challenge_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/auth/login/define-challenge"
  output_path = "${path.module}/define-challenge.zip"
}

resource "aws_lambda_function" "define_challenge" {
  filename         = data.archive_file.define_challenge_zip.output_path
  function_name    = "saws-define-challenge-${var.env}"
  role             = data.aws_iam_role.lab_role.arn
  handler          = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.define_challenge_zip.output_base64sha256
  runtime          = "python3.10"
}

data "archive_file" "verify_challenge_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/auth/login/verify-challenge"
  output_path = "${path.module}/verify-challenge.zip"
}

resource "aws_lambda_function" "verify_challenge" {
  filename         = data.archive_file.verify_challenge_zip.output_path
  function_name    = "saws-verify-challenge-${var.env}"
  role             = data.aws_iam_role.lab_role.arn
  handler          = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.verify_challenge_zip.output_base64sha256
  runtime          = "python3.10"

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

data "archive_file" "signup_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/auth/signup"
  output_path = "${path.module}/signup.zip"
}

resource "aws_lambda_function" "signup" {
  filename         = data.archive_file.signup_zip.output_path
  function_name    = "saws-signup-${var.env}"
  role             = data.aws_iam_role.lab_role.arn
  handler          = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.signup_zip.output_base64sha256
  runtime          = "python3.10"

  environment {
    variables = {
      USERS_TABLE  = aws_dynamodb_table.users.name
      USER_POOL_ID = aws_cognito_user_pool.auth.id
      CLIENT_ID    = aws_cognito_user_pool_client.auth_client.id
    }
  }
}

data "archive_file" "login_wrapper_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/auth/login/saws-login"
  output_path = "${path.module}/saws-login.zip"
}

resource "aws_lambda_function" "login_wrapper" {
  filename         = data.archive_file.login_wrapper_zip.output_path
  function_name    = "saws-login-${var.env}"
  role             = data.aws_iam_role.lab_role.arn
  handler          = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.login_wrapper_zip.output_base64sha256
  runtime          = "python3.10"

  environment {
    variables = {
      USER_POOL_ID = aws_cognito_user_pool.auth.id
      CLIENT_ID    = aws_cognito_user_pool_client.auth_client.id
    }
  }
}

# Cognito User Pool
resource "aws_cognito_user_pool" "auth" {
  name = "saws-auth-${var.env}"

  auto_verified_attributes = ["email"]

  lambda_config {
    create_auth_challenge          = aws_lambda_function.create_challenge.arn
    define_auth_challenge          = aws_lambda_function.define_challenge.arn
    verify_auth_challenge_response = aws_lambda_function.verify_challenge.arn
  }
}

resource "aws_cognito_user_pool_client" "auth_client" {
  name         = "saws-auth-api-${var.env}"
  user_pool_id = aws_cognito_user_pool.auth.id

  explicit_auth_flows = [
    "ALLOW_CUSTOM_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

# Lambda Permissions for Cognito
resource "aws_lambda_permission" "allow_cognito_create" {
  statement_id  = "AllowExecutionFromCognitoCreate"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_challenge.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.auth.arn
}

resource "aws_lambda_permission" "allow_cognito_define" {
  statement_id  = "AllowExecutionFromCognitoDefine"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.define_challenge.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.auth.arn
}

resource "aws_lambda_permission" "allow_cognito_verify" {
  statement_id  = "AllowExecutionFromCognitoVerify"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.verify_challenge.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.auth.arn
}
