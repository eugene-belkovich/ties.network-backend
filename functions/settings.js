'use strict'

var doc = require('dynamodb-doc')
var dynamodbDocClient = new doc.DynamoDB()

module.exports.get = (event, context, callback) => {
  console.log(event)
  const groups = event.cognitoPoolClaims.groups

  if (groups && groups.includes('Admin')) {
    dynamodbDocClient.getItem({
      'TableName': `${process.env.environment}.settings`,
      'Key': {
        'key': 'key'
      }
    }, (err, data) => {

      if (err) {
        console.log(err)
      }

      const settingsData = data.Item
      delete settingsData.key
      return callback(null, settingsData)
    })
  } else {
    return callback(null, {})
  }
}

module.exports.put = (event, context, callback) => {
  console.log(event)
  const endTimestamp = Number(event.body.endTimestamp)
  const ethRate = Number(event.body.ethRate)
  const btcRate = Number(event.body.btcRate)
  const groups = event.cognitoPoolClaims.groups

  if (!groups || !groups.includes('Admin')) {
    return callback('[403] Forbidden')
  }

  if (endTimestamp && ethRate && btcRate) {
    dynamodbDocClient.putItem({
      'TableName': `${process.env.environment}.settings`,
      'Item': {
        'endTimestamp': endTimestamp,
        'ethRate': ethRate,
        'btcRate': btcRate,
        'key': 'key'
      }
    }, (err, data) => {
      if (err) {
        callback('[400] Save to DB error')
      } else {
        console.log(data)
        callback(null, data)
      }
    })
  } else {
    callback('[400] Some required fields is missing')
  }
}
