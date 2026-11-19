variable "project_id" {
  type        = string
  description = "GCP project ID for the luna-x Cloud Run deployment"
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "GCP region for the luna-x Cloud Run v2 service"
}

variable "image" {
  type        = string
  description = "Container image URI for the luna-x Cloud Run v2 service"
}
