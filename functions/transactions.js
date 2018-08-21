const doc = require('dynamodb-doc')
const dynamodbDocClient = new doc.DynamoDB()

const getEthTransactionList = (etherWallet) => {
  const params = {
    TableName: `${process.env.environment}.eth_transactions`,
    FilterExpression: '#from = :from',
    IndexName: 'from-index',
    ExpressionAttributeNames: {
      '#from': 'from'
    },
    ExpressionAttributeValues: {
      ':from': etherWallet.toLowerCase()
    }
  }

  if (!etherWallet) {
    return Promise.resolve([])
  }

  const ethTransactions = []

  return new Promise((resolve) => {
    const onScan = (err, data) => {
      if (err) {
        console.error('Unable to query. Error:', JSON.stringify(err, null, 2))
      } else {
        console.log('Query succeeded.')

        data.Items.forEach(transaction => ethTransactions.push(transaction))

        // continue scanning if we have more users, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey
          dynamodbDocClient.scan(params, onScan)
        } else {
          resolve(ethTransactions)
        }
      }
    }

    dynamodbDocClient.scan(params, onScan)
  })
}

const geBtcTransactionList = (email) => {
  const params = {
    TableName: `${process.env.environment}.btc_transactions`,
    FilterExpression: 'sendTo = :sendTo',
    ExpressionAttributeValues: {
      ':sendTo': email
    }
  }

  const btcTransactions = []

  return new Promise((resolve) => {
    const onScan = (err, data) => {
      if (err) {
        console.error('Unable to query. Error:', JSON.stringify(err, null, 2))
      } else {
        console.log('Query succeeded.')

        data.Items.forEach(transaction => btcTransactions.push(transaction))

        // continue scanning if we have more users, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey
          dynamodbDocClient.scan(params, onScan)
        } else {
          resolve(btcTransactions)
        }
      }
    }

    dynamodbDocClient.scan(params, onScan)
  })
}


module.exports.get = (event, context, callback) => {
  console.log(event)
  const { email } = event.cognitoPoolClaims

  dynamodbDocClient.getItem({
    'TableName': `${process.env.environment}.users_wallets`,
    'Key': {
      'userId': email
    }
  }).promise()
    .then((data) => {
      const etherWallet = data.Item ? data.Item.etherWallet : null

      Promise.all([
        getEthTransactionList(etherWallet).catch(() => Promise.resolve([])),
        geBtcTransactionList(email).catch(() => Promise.resolve([]))
      ])
        .then((data) => {
          const ethTransaction = data[0].map(x => Object.assign(x, { isEthereum: true }))
          const btcTransaction = data[1].map(x => Object.assign(x, { isBitcoin: true }))
          const result = [...ethTransaction, ...btcTransaction]
          callback(null, result)
        })
    })
}