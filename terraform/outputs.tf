output "api_endpoint" {
  description = "Base URL for API Gateway stage"
  value       = "${aws_api_gateway_deployment.api_deployment.invoke_url}${aws_api_gateway_stage.api_stage.stage_name}"
}