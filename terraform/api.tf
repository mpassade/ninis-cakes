resource "aws_api_gateway_rest_api" "api" {
    name = "${substr(var.domain, 0, 10)}-api"
    binary_media_types = ["*/*"]
    tags = {
        Project = var.project
    }
}

resource "aws_api_gateway_resource" "proxy" {
    rest_api_id = aws_api_gateway_rest_api.api.id
    parent_id   = aws_api_gateway_rest_api.api.root_resource_id
    path_part   = "{proxy+}"
}

module "root_http_any" {
    source = "./modules/api-gateway_method"
    api = aws_api_gateway_rest_api.api.id
    http = "ANY"
    resource = aws_api_gateway_rest_api.api.root_resource_id
    lambda_uri = aws_lambda_function.lambda.invoke_arn
}

module "root_http_options" {
    source = "./modules/api-gateway_method"
    api = aws_api_gateway_rest_api.api.id
    http = "OPTIONS"
    resource = aws_api_gateway_rest_api.api.root_resource_id
    lambda_uri = aws_lambda_function.lambda.invoke_arn
}

module "proxy_http_any" {
    source = "./modules/api-gateway_method"
    api = aws_api_gateway_rest_api.api.id
    http = "ANY"
    resource = aws_api_gateway_resource.proxy.id
    lambda_uri = aws_lambda_function.lambda.invoke_arn
}

module "proxy_http_options" {
    source = "./modules/api-gateway_method"
    api = aws_api_gateway_rest_api.api.id
    http = "OPTIONS"
    resource = aws_api_gateway_resource.proxy.id
    lambda_uri = aws_lambda_function.lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "deploy" {
    rest_api_id = aws_api_gateway_rest_api.api.id
    stage_name = "prod"
    lifecycle {
        create_before_destroy = true
    }
}

resource "aws_api_gateway_domain_name" "domain" {
    certificate_arn = aws_acm_certificate.cert.arn
    domain_name     = var.domain
    tags = {
        Project = var.project
    }
}

resource "aws_api_gateway_base_path_mapping" "mapping" {
    api_id      = aws_api_gateway_rest_api.api.id
    stage_name  = aws_api_gateway_deployment.deploy.stage_name
    domain_name = aws_api_gateway_domain_name.domain.domain_name
}