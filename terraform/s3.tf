resource "aws_s3_bucket" "bucket" {
    bucket = var.bucket
    versioning {
        enabled = true
    }
    tags = {
        Project = var.project
    }
}

resource "aws_s3_bucket_object" "zip" {
    bucket = var.bucket
    key = var.zip
    source = "../s3/${var.zip}"
    content_type = lookup(var.mime_types, split(".", var.zip)[1])
    etag = filemd5("../s3/${var.zip}")
    tags = {
        Project = var.project
    }
}

resource "aws_s3_bucket_object" "css" {
    for_each = fileset("../s3/public/css/", "*")
    bucket = var.bucket
    acl = "public-read"
    key = "public/css/${each.value}"
    source = "../s3/public/css/${each.value}"
    content_type = lookup(var.mime_types, split(".", each.value)[1])
    etag = filemd5("../s3/public/css/${each.value}")
    tags = {
        Project = var.project
    }
}

resource "aws_s3_bucket_object" "images" {
    for_each = fileset("../s3/public/images/", "*")
    bucket = var.bucket
    acl = "public-read"
    key = "public/images/${each.value}"
    source = "../s3/public/images/${each.value}"
    content_type = lookup(var.mime_types, split(".", each.value)[1])
    etag = filemd5("../s3/public/images/${each.value}")
    tags = {
        Project = var.project
    }
}

resource "aws_s3_bucket_object" "js" {
    for_each = fileset("../s3/public/js/", "*")
    bucket = var.bucket
    acl = "public-read"
    key = "public/js/${each.value}"
    source = "../s3/public/js/${each.value}"
    content_type = lookup(var.mime_types, split(".", each.value)[1])
    etag = filemd5("../s3/public/js/${each.value}")
    tags = {
        Project = var.project
    }
}
