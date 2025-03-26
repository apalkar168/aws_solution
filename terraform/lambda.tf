# Create a single ZIP archive for all Lambda functions including node_modules
resource "null_resource" "install_dependencies" {
  provisioner "local-exec" {
    command = "cd ${path.root}/../src && npm install"
  }
}

data "archive_file" "lambda_functions" {
  depends_on  = [null_resource.install_dependencies]
  type        = "zip"
  source_dir  = "${path.root}/../src"
  output_path = "${path.root}/lambda_functions.zip"
}

# Lambda Function for Create operation
resource "aws_lambda_function" "create_item" {
  function_name = "${local.name_prefix}-create-item-${local.unique_suffix}"
  handler       = "handlers/create.handler"
  runtime       = "nodejs16.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = data.archive_file.lambda_functions.output_path
  
  # This ensures the Lambda function is updated when the source code changes
  source_code_hash = data.archive_file.lambda_functions.output_base64sha256
  
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.items_table.name
    }
  }
  
  tags = local.tags
}

# Lambda Function for Read operation
resource "aws_lambda_function" "get_item" {
  function_name = "${local.name_prefix}-get-item-${local.unique_suffix}"
  handler       = "handlers/get.handler"
  runtime       = "nodejs16.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = data.archive_file.lambda_functions.output_path
  
  source_code_hash = data.archive_file.lambda_functions.output_base64sha256
  
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.items_table.name
    }
  }
  
  tags = local.tags
}

# Lambda Function for Update operation
resource "aws_lambda_function" "update_item" {
  function_name = "${local.name_prefix}-update-item-${local.unique_suffix}"
  handler       = "handlers/update.handler"
  runtime       = "nodejs16.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = data.archive_file.lambda_functions.output_path
  
  source_code_hash = data.archive_file.lambda_functions.output_base64sha256
  
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.items_table.name
    }
  }
  
  tags = local.tags
}

# Lambda Function for Delete operation
resource "aws_lambda_function" "delete_item" {
  function_name = "${local.name_prefix}-delete-item-${local.unique_suffix}"
  handler       = "handlers/delete.handler"
  runtime       = "nodejs16.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = data.archive_file.lambda_functions.output_path
  
  source_code_hash = data.archive_file.lambda_functions.output_base64sha256
  
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.items_table.name
    }
  }
  
  tags = local.tags
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "create_item_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.items_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_item_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.items_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_item_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.items_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_item_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.items_api.execution_arn}/*/*"
}