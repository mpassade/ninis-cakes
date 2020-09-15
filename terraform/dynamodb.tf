resource "aws_dynamodb_table" "cake" {
    name = "niniscakes-cakes"
    billing_mode = "PROVISIONED"
    read_capacity = 5
    write_capacity = 5
    hash_key = "name"
    attribute {
        name = "name"
        type = "S"
    }
    tags = {
        Project = var.project
    }
}

resource "aws_dynamodb_table" "quote" {
    name = "niniscakes-quotes"
    billing_mode = "PROVISIONED"
    read_capacity = 5
    write_capacity = 5
    hash_key = "_id"
    attribute {
        name = "_id"
        type = "S"
    }
    tags = {
        Project = var.project
    }
}

resource "aws_dynamodb_table" "user" {
    name = "niniscakes-users"
    billing_mode = "PROVISIONED"
    read_capacity = 5
    write_capacity = 5
    hash_key = "_id"
    attribute {
        name = "_id"
        type = "S"
    }
    tags = {
        Project = var.project
    }
}