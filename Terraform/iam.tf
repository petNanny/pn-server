# # Task execution role for ECS 
# resource "aws_iam_role" "ecs-task-execution" {
#   name = "ecsTaskExecutionRole"

#   # Terraform's "jsonencode" function converts a
#   # Terraform expression result to valid JSON syntax.
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Action = [
#           "ecr:GetAuthorizationToken",
#           "ecr:BatchCheckLayerAvailability",
#           "ecr:GetDownloadUrlForLayer",
#           "ecr:BatchGetImage",
#           "logs:CreateLogStream",
#           "logs:PutLogEvents"
#         ],
#         Resource = "*"
#       },
#     ]
#   })
# }

# ECS task execution role and policy
data "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"
}

data "aws_iam_policy" "ecs_task_execution_policy" {
  name = "AmazonECSTaskExecutionRolePolicy"
}
