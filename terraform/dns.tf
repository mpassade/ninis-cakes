data "aws_route53_zone" "public" {
    name = var.domain
    private_zone = false
}

resource "aws_route53_record" "cert_validation" {
    for_each = {
        for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
            name   = dvo.resource_record_name
            record = dvo.resource_record_value
            type   = dvo.resource_record_type
        }
    }
    allow_overwrite = true
    zone_id = data.aws_route53_zone.public.zone_id
    name = each.value.name
    records = [each.value.record]
    type = each.value.type
    ttl = 300
}

resource "aws_route53_record" "cdn-a" {
    allow_overwrite = true
    zone_id = data.aws_route53_zone.public.zone_id
    name = var.domain
    type = "A"
    alias {
        name = aws_api_gateway_domain_name.domain.cloudfront_domain_name
        zone_id = aws_api_gateway_domain_name.domain.cloudfront_zone_id
        evaluate_target_health = false
    }
}

resource "aws_route53_record" "cdn-aaaa" {
    allow_overwrite = true
    zone_id = data.aws_route53_zone.public.zone_id
    name = var.domain
    type = "AAAA"
    alias {
        name = aws_api_gateway_domain_name.domain.cloudfront_domain_name
        zone_id = aws_api_gateway_domain_name.domain.cloudfront_zone_id
        evaluate_target_health = false
    }
}
