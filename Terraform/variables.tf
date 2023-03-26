variable "vpc_cidr_block" {
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr_blocks" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidr_blocks" {
  type    = list(string)
  default = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "availability_zone" {
  type    = list(string)
  default = ["ap-southeast-2a", "ap-southeast-2b"]
}

variable "env_prefix" {
  default = "dev"
}

variable "health_check_path" {
  description = "health ceck path pn server"
  default     = "/api/petSitters"
}

variable "pn-server-container-count" {
  description = "number of docker containers to run"
  default     = 2
}

variable "pn-server-port" {
  description = "port exposed by the docker image to redirect traffic to"
  default     = 5000
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  default     = "512"
}

variable "fargate_memory" {
  description = "Fargate instance memory to provision (in MiB)"
  default     = "1024"
}

# variable "pn_server_image" {
#   description = "Docker image to run in the ECS cluster"
#   default: "xxx"

# }

variable "root_domain" {
  description = "Pet Nanny root domain"
  default     = "petnanny.live"
}

variable "repo_url" {
  description = "ECR dev pn backend url repo"
  default     = "312518712322.dkr.ecr.ap-southeast-2.amazonaws.com/pet-nanny-dev"
}

variable "image_tag" {
  description = "dev pn backend image tag"
  default     = "latest"
}