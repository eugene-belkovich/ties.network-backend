const doc = require('dynamodb-doc')
const dynamodbDocClient = new doc.DynamoDB()

module.exports.get = (event, context, callback) => {
  console.log(event)

  dynamodbDocClient.getItem({
    'TableName': `${process.env.environment}.users_wallets`,
    'Key': {
      'userId': event.cognitoPoolClaims.email
    }
  }).promise()
    .then((data) => {
      const item = data.Item
      if (!item.ip || !item.country) {
        return dynamodbDocClient.updateItem({
          'TableName': `${process.env.environment}.users_wallets`,
          'Key': {
            'userId': event.cognitoPoolClaims.email,
          },
          UpdateExpression: 'SET ip = :ip, country = :country',
          ExpressionAttributeValues: {
            ':ip': event && event.identity && event.identity.sourceIp ? event.identity.sourceIp : 'Unknown',
            ':country': event.headers['CloudFront-Viewer-Country'] || 'Unknown',
          },
          ReturnValues: 'ALL_NEW',
        }).promise()
          .then(data => data.Attributes)
      }
      return Promise.resolve(item)
    })
    .then((item) => {
      const fourtyMinutesAgo = new Date().getTime() - 40 * 60 * 1000
      dynamodbDocClient.query({
        'TableName': `${process.env.environment}.btc_wallets`,
        IndexName: 'userId-lockedForever-index',
        KeyConditionExpression: 'userId = :userId AND lockedForever = :true',
        ExpressionAttributeValues: {
          ':userId': event.cognitoPoolClaims.email,
          ':true': 'true'
        }
      }).promise()
        .then((data) => {
          if (data.Items.length > 0) {
            console.dir(data.Items[0])
            item.btcWallet = data.Items[0].wallet
            item.btcWalletAssignedAt = data.Items[0].assignedAt
            item.btcWalletLockedForever = data.Items[0].lockedForever

            if (!item) {
              callback(null, {})
            } else {
              callback(null, removeHiddenAttributes(item))
            }
          } else {
            return dynamodbDocClient.query({
              'TableName': `${process.env.environment}.btc_wallets`,
              IndexName: 'userId-assignedAt-index',
              KeyConditionExpression: 'userId = :userId AND assignedAt > :time',
              ExpressionAttributeValues: {
                ':userId': event.cognitoPoolClaims.email,
                ':time': fourtyMinutesAgo
              }
            }).promise()
          }
        })
        .then((data) => {
          if (data && data.Items && data.Items.length > 0) {
            console.dir(data.Items[0])
            item.btcWallet = data.Items[0].wallet
            item.btcWalletAssignedAt = data.Items[0].assignedAt
          }

          if (!item) {
            callback(null, {})
          } else {
            callback(null, removeHiddenAttributes(item))
          }
        })
    })
    .catch((err) => {
      console.log(err)
      callback(err)
    })
}


const removeHiddenAttributes = (user) => {
  const userCopy = Object.assign({}, user)
  delete userCopy.isUnique
  delete userCopy.userId
  delete userCopy.ip
  return userCopy
}

module.exports.postConfirmation = (event, context, callback) => {
  console.log(event.request.userAttributes)
  const { email, sub } = event.request.userAttributes
  const from = event.request.userAttributes['custom:from'] || ''

  dynamodbDocClient.updateItem({
    'TableName': `${process.env.environment}.users_wallets`,
    'Key': {
      'userId': email,
    },
    UpdateExpression: 'SET cognitoId = :sub, #from = :from',
    ExpressionAttributeValues: {
      ':sub': sub,
      ':from': from,
    },
    ExpressionAttributeNames: {
      '#from': 'from'
    },
  })
    .promise()
    .then(() => callback(null, event))
    .catch(() => callback(null, event))
}

module.exports.referrals = (event, context, callback) => {
  const userCognitoId = event.cognitoPoolClaims.sub
  findReferrals(userCognitoId)
    .then(result => callback(null, result))
    .catch(error => callback(error))
}

function findReferrals(userCognitoId) {
  const params = {
    TableName: `${process.env.environment}.users_wallets`,
    FilterExpression: '#from = :from',
    ExpressionAttributeNames: {
      '#from': 'from'
    },
    ExpressionAttributeValues: {
      ':from': userCognitoId
    }
  }

  const referrals = []

  return new Promise((resolve) => {
    const onScan = (err, data) => {
      if (err) {
        console.error('Unable to query. Error:', JSON.stringify(err, null, 2))
      } else {
        console.log('Query succeeded.')

        data.Items.forEach(referral => {
          const { cognitoId, balance, isUnique } = referral
          if (isUnique !== false) {
            referrals.push({ cognitoId, balance })
          }
        })

        // continue scanning if we have more users, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey
          dynamodbDocClient.scan(params, onScan)
        } else {
          resolve(referrals)
        }
      }
    }

    dynamodbDocClient.scan(params, onScan)
  })
}