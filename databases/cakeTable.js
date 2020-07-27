const AWS = require('aws-sdk')

AWS.config.update({
    region: "us-east-1",
    endpoint: process.env.DYNAMODB_URI
})

const dynamodb = new AWS.DynamoDB();

const params = {
    TableName : "niniscakes-cakes",
    KeySchema: [       
        { AttributeName: "name", KeyType: "HASH" }
    ],
    AttributeDefinitions: [       
        { AttributeName: "name", AttributeType: "S" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 5, 
        WriteCapacityUnits: 5
    },
    BillingMode: "PROVISIONED"
}

dynamodb.createTable(params, (err, data) => {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2))
    } else {
        console.log("Table Created. Table description JSON:", JSON.stringify(data, null, 2))
    }
})