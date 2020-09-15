data "aws_iam_policy_document" "assume_role" {
    statement {
        actions = ["sts:AssumeRole"]
        principals {
            type = "Service"
            identifiers = ["lambda.amazonaws.com"]
        }
    }
}

data "aws_iam_policy_document" "log" {
    statement {
        actions = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
        ]
        resources = ["arn:aws:logs:*:*:*"]
    }
}

resource "aws_iam_role" "lambda" {
    name = var.role
    assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "dynamodb" {
    role = var.role
    policy_arn = var.dynamodb_policy
}

resource "aws_iam_role_policy" "log" {
    name = var.log_policy
    role = aws_iam_role.lambda.id
    policy = data.aws_iam_policy_document.log.json
}