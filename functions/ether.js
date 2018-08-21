'use strict'

var doc = require('dynamodb-doc')
var dynamodbDocClient = new doc.DynamoDB()

module.exports.setEther = (event, context, callback) => {

    console.log(event)

    console.log(context)

    dynamodbDocClient.getItem({
        'TableName': `${process.env.environment}.users_wallets`,
        'Key': {
            'userId': event.cognitoPoolClaims.email
        }
    }).promise().then((data) => {
        const item = data.Item

        if (item && item.etherWallet) {

            callback(new Error(`[400] Can't update wallet`));
        } else {
          return findDuplicates(event.body.wallet)
            .then(duplicates => {
              const isUnique = !duplicates || !duplicates.length
              console.log(duplicates)
              console.log(isUnique)
              return dynamodbDocClient.updateItem({
                'TableName': `${process.env.environment}.users_wallets`,
                'Key': {
                  'userId': event.cognitoPoolClaims.email,
                },
                UpdateExpression: 'SET etherWallet = :ethWallet, isUnique=:isUnique',
                ExpressionAttributeValues: {
                  ':ethWallet': event.body.wallet,
                  ':isUnique': isUnique,
                }
              }).promise()
            })
        }
    }).then(() => {
        return dynamodbDocClient.getItem({
            'TableName': `${process.env.environment}.users_wallets`,
            'Key': {
                'userId': event.cognitoPoolClaims.email
            }
        }).promise()
    }).then((data) => {
        const item = data.Item

        if (!item) {
            callback(null, {})
        } else {
            delete item.userId

            callback(null, item)
        }
    })
}

function findDuplicates(etherWallet) {
  const params = {
    TableName: `${process.env.environment}.users_wallets`,
    FilterExpression: 'etherWallet = :etherWallet',
    ExpressionAttributeValues: {
      ':etherWallet': etherWallet
    }
  }

  const wallets = []

  return new Promise((resolve) => {
    const onScan = (err, data) => {
      if (err) {
        console.error('Unable to query. Error:', JSON.stringify(err, null, 2))
      } else {
        console.log('Query succeeded.')

        data.Items.forEach(users => {
          const { cognitoId, balance } = users
          wallets.push({ cognitoId, balance })
        })

        // continue scanning if we have more users, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey
          dynamodbDocClient.scan(params, onScan)
        } else {
          resolve(wallets)
        }
      }
    }

    dynamodbDocClient.scan(params, onScan)
  })
}