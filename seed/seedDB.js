const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')

AWS.config.update({
    region: "us-east-1",
    endpoint: process.env.DYNAMODB_URI
})

const docClient = new AWS.DynamoDB.DocumentClient()
const allCakes = JSON.parse(fs.readFileSync(path.join(__dirname, 'cakeSeed.json'), 'utf8'))

allCakes.forEach(cake => {
    const params = {
        TableName: 'niniscakes-cakes',
        Item: {
            "name":  cake.name,
            "order": cake.order,
            "description": cake.description,
            "image": cake.image,
        }
    }

    docClient.put(params, (err) => {
        if (err) {
            console.error("Unable to add cake", cake.name, ". Error JSON:", JSON.stringify(err, null, 2))
        } else {
            console.log("PutItem succeeded:", cake.name)
        }
    })
})