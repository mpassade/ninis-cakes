resource "aws_lambda_function" "lambda" {
    function_name = "${substr(var.domain, 0, 10)}-lambda"
    s3_bucket = var.bucket
    s3_key = var.zip
    s3_object_version = aws_s3_bucket_object.zip.version_id
    handler = "lambda.handler"
    role = aws_iam_role.lambda.arn
    runtime = "nodejs12.x"
    timeout = 20
    source_code_hash = filebase64sha256("../s3/${var.zip}")
    environment {
        variables = {
            DYNAMODB_URI = "https://dynamodb.us-east-1.amazonaws.com"
            SMTP_URI = "email-smtp.us-east-1.amazonaws.com"
            SMTP_PORT = 587
        }
    }
    tags = {
        Project = var.project
    }
}

resource "aws_lambda_permission" "apigw" {
    statement_id  = "AllowAPIGatewayInvoke"
    action        = "lambda:InvokeFunction"
    function_name = aws_lambda_function.lambda.function_name
    principal     = "apigateway.amazonaws.com"
    source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/*/*"
}