'use strict'

var doc = require('dynamodb-doc')
var dynamodbDocClient = new doc.DynamoDB()

module.exports.get = (event, context, callback) => {

    console.log(event)

    var params = {
        TableName: `${process.env.environment}.contract_data`,
        KeyConditionExpression: '#key = :key',
        Limit: 1,
        ScanIndexForward: false,    // true = ascending, false = descending
        ExpressionAttributeNames: {
            '#key': 'key'
        },
        ExpressionAttributeValues: {
            ':key': 'key'
        }
    };

    dynamodbDocClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            console.log(data)

            const contractData = data.Items[0]

            dynamodbDocClient.getItem({
                'TableName': `${process.env.environment}.settings`,
                'Key': {
                    'key': 'key'
                }
            }, (err, data) => {

                if(err) {
                    console.log(err)
                }

                delete contractData.key
                contractData.endTimestamp = data.Item.endTimestamp
                contractData.ethRate = data.Item.ethRate
                contractData.btcRate = data.Item.btcRate

                callback(null, contractData)
            })

        }
    });
}
