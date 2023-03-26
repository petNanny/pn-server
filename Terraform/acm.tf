# # Request a SSL certificate for pn server 
# resource "aws_acm_certificate" "pn-server-cert" {
#   domain_name       = "${var.env_prefix}.${var.root_domain}"
#   validation_method = "DNS"

#   tags = {
#     Environment = "${var.env_prefix}"
#   }

#   lifecycle {
#     create_before_destroy = true
#   }
# }

data "aws_route53_zone" "pn-zone" {
  name         = var.root_domain
  private_zone = false
}


# Find a certificate that is issued
data "aws_acm_certificate" "issued" {
  domain   = "*.${var.root_domain}"
  statuses = ["ISSUED"]
}

resource "aws_route53_record" "pn-server-record" {
  zone_id = data.aws_route53_zone.pn-zone.id
  name    = "${var.env_prefix}-backend.${data.aws_route53_zone.pn-zone.name}"
  type    = "A"

  alias {
    name                   = aws_lb.pn-server-alb.dns_name
    zone_id                = aws_lb.pn-server-alb.zone_id
    evaluate_target_health = true

  }
}

# resource "aws_acm_certificate_validation" "pn-server-cert" {
#   certificate_arn         = aws_acm_certificate.pn-server-cert.arn
# }