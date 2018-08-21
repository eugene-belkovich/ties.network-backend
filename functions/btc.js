'use strict'

var doc = require('dynamodb-doc')
var dynamodbDocClient = new doc.DynamoDB()

const lookForWallet = (user, callback) => {
  const fourtyMinutesAgo = new Date().getTime() - 40 * 60 * 1000

  return dynamodbDocClient.query({
    TableName: `${process.env.environment}.btc_wallets`,
    IndexName: 'lockedForever-order-index',
    KeyConditionExpression: 'lockedForever = :false',
    FilterExpression: `assignedAt < :fourtyMinutesAgo OR attribute_not_exists(assignedAt)`,
    ExpressionAttributeValues: {
      ':fourtyMinutesAgo': fourtyMinutesAgo,
      ':false': 'false',
    }
  }).promise()
    .then((data) => {
      if (data.Items.length < 1) {
        return callback(new Error(`[400] Can't find an unassigned BTC wallet`))
      }

      const wallet = data.Items[0].wallet

      const fourtyMinutesAgo = new Date().getTime() - 40 * 60 * 1000

      dynamodbDocClient.updateItem({
        'TableName': `${process.env.environment}.btc_wallets`,
        'Key': {
          'wallet': wallet,
        },
        UpdateExpression: 'SET userId = :userId, assignedAt = :timestamp, lockedForever = :true',
        ExpressionAttributeValues: {
          ':userId': user.userId,
          ':timestamp': new Date().getTime(),
          ':fourtyMinutesAgo': fourtyMinutesAgo,
          ':false': 'false',
          ':true': 'true',
        },
        ConditionExpression: `(assignedAt < :fourtyMinutesAgo OR attribute_not_exists(assignedAt)) AND lockedForever = :false`,
      }).promise().catch((err) => {
        console.log(err)
        return lookForWallet(user, callback)  // https://github.com/aws/aws-sdk-js/issues/1004
      })
        .then((data) => callback(null, {}))
        .catch((err) => {
          console.log(err)
          return callback(new Error(`[500] Internal server error`))
        })
    })
}

module.exports.assign = (event, context, callback) => {

  console.log(event)

  dynamodbDocClient.getItem({
    'TableName': `${process.env.environment}.users_wallets`,
    'Key': {
      'userId': event.cognitoPoolClaims.email
    }
  }).promise().then((data) => {
    const user = data.Item

    if (!user.etherWallet) {
      callback(new Error(`[400] Can't assign btc wallet to user without eth wallet specified`))
    } else {

      const fourtyMinutesAgo = new Date().getTime() - 40 * 60 * 1000

      dynamodbDocClient.query({
        'TableName': `${process.env.environment}.btc_wallets`,
        IndexName: 'userId-lockedForever-index',
        KeyConditionExpression: 'userId = :userId AND lockedForever = :true',
        ExpressionAttributeValues: {
          ':userId': user.userId,
          ':true': 'true'
        }
      }).promise().then((data) => {
        if (data.Items.length > 0) {
          callback(null, {})
        } else {
          return dynamodbDocClient.query({
            'TableName': `${process.env.environment}.btc_wallets`,
            IndexName: 'userId-assignedAt-index',
            KeyConditionExpression: 'userId = :userId AND assignedAt > :time',
            ExpressionAttributeValues: {
              ':userId': user.userId,
              ':time': fourtyMinutesAgo,
            }
          }).promise()
        }
      }).then((data) => {
        if (data.Items.length > 0) {
          return dynamodbDocClient.updateItem({
            'TableName': `${process.env.environment}.btc_wallets`,
            'Key': {
              'wallet': data.Items[0].wallet,
            },
            UpdateExpression: 'SET userId = :userId, assignedAt = :timestamp',
            ExpressionAttributeValues: {
              ':userId': user.userId,
              ':timestamp': new Date().getTime()
            },
            ConditionExpression: `userId = :userId`,
          }).promise().then((data) => {
            callback(null, {})
          })
        } else {
          lookForWallet(user, callback)
        }
      })
    }
  })
}

module.exports.updateTable = (event, context, callback) => {
  const params = {
    TableName: `${process.env.environment}.btc_wallets`,
    FilterExpression: 'attribute_not_exists(#order) OR attribute_not_exists(lockedForever)',
    ExpressionAttributeNames: {
      '#order': 'order'
    },
  }

  const rows = []

  return new Promise((resolve) => {
    const onScan = (err, data) => {
      if (err) {
        console.error('Unable to query. Error:', JSON.stringify(err, null, 2))
      } else {
        console.log('Query succeeded.')

        data.Items.forEach(row => rows.push(row))

        // continue scanning if we have more users, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey
          dynamodbDocClient.scan(params, onScan)
        } else {
          resolve(rows)
        }
      }
    }

    dynamodbDocClient.scan(params, onScan)
  })
    .then((res) => {
      console.log(res)
      return res.reduce((promise, item, index) => {
        return promise
          .then(() => {
            return dynamodbDocClient.updateItem({
              'TableName': `${process.env.environment}.btc_wallets`,
              'Key': {
                'wallet': item.wallet,
              },
              UpdateExpression: 'SET #order = :order, lockedForever = :lockedForever',
              ExpressionAttributeValues: {
                ':order': index + 1,
                ':lockedForever': item.lockedForever || 'false',
              },
              ExpressionAttributeNames: {
                '#order': 'order'
              },
            }).promise()
          })
          .catch((err) => {
            console.log(err)
            callback(err)
          })
      }, Promise.resolve())
    })
    .then(() => callback(null, {}))
    .catch((err) => {
      console.log(err)
      callback(err)
    })
}