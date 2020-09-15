resource "aws_api_gateway_method" "method" {
    rest_api_id = var.api
    resource_id = var.resource
    http_method = var.http
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "integration" {
    rest_api_id = var.api
    resource_id = var.resource
    http_method = var.http
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = var.lambda_uri
}

resource "aws_api_gateway_method_response" "method_res" {
    rest_api_id = var.api
    resource_id = var.resource
    http_method = var.http
    status_code = "200"
}

resource "aws_api_gateway_integration_response" "integration_res" {
    rest_api_id = var.api
    resource_id = var.resource
    http_method = var.http
    status_code = "200"
}