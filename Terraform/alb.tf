# ALB for the PN Server
resource "aws_lb" "pn-server-alb" {
  name               = "${var.env_prefix}-pn-server-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.pn-server-alb-sg.id]
  subnets            = [aws_subnet.pn-server-public-subnet[0].id, aws_subnet.pn-server-public-subnet[1].id]

  enable_deletion_protection = false

  tags = {
    Environment = "${var.env_prefix}"
    Name        = "${var.env_prefix}-pn-server-alb"
  }
}

# ALB targert group
resource "aws_lb_target_group" "pn-server-alb-tg" {
  name        = "${var.env_prefix}-pn-server-alb-tg"
  target_type = "ip"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.pn-server-vpc.id

  health_check {
    healthy_threshold   = "3"  # Number of consecutive health check successes required before considering a target healthy.
    interval            = "30" # Approximate amount of time, in seconds, between health checks of an individual target.
    protocol            = "HTTP"
    matcher             = "200" # Response codes to use when checking for a healthy responses from a target.
    timeout             = "6"   # Amount of time, in seconds, during which no response from a target means a failed health check.
    path                = var.health_check_path
    unhealthy_threshold = "2" # Number of consecutive health check failures required before considering a target unhealthy. 
  }

  tags = {
    "Name" = "${var.env_prefix}-pn-server-alb-tg"
  }
}

# Redirect HTTP traffic from to HTTPS
resource "aws_lb_listener" "http-https" {
  load_balancer_arn = aws_lb.pn-server-alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Forward HTTPS traffic from the ALB to the target group
resource "aws_alb_listener" "https-alb" {
  load_balancer_arn = aws_lb.pn-server-alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.issued.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.pn-server-alb-tg.arn

  }
}


