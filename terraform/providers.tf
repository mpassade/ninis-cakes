provider "aws" {
    region = "us-east-1"
}

terraform {
    backend "s3" {
        region  = "us-east-1"
        bucket  = "mpassade-niniscakes-tfstate"
        key     = "state/niniscakes.tfstate"
        encrypt = true
        acl     = "bucket-owner-full-control"
    }
}

