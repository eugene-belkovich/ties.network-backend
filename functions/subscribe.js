'use strict'

const crypto = require('crypto');
const http = require('http');
const md5sum = string => crypto.createHash('md5').update(string).digest('hex');

module.exports.post = (event, context, callback) => {
    subscribeToMailListByEmail(event.body.email, callback)
};

const mailConfig = {
    apiKey: "fd330e0cfcd4f756a2c61aa16cabd91c-us15",
    listId: "9ec307cd8f",
    get host() {
        return this.apiKey.split('-')[1] + '.api.mailchimp.com';
    }
};

function subscribeToMailListByEmail(email_address, callback) {
    const dataJson = JSON.stringify({ email_address, status_if_new: 'subscribed' });

    const req = http.request({
        host: `${mailConfig.host}`,
        path: `/3.0/lists/${mailConfig.listId}/members/${md5sum(email_address)}`,
        method: 'PUT',
        headers: {
            Authorization: `apiKey ${mailConfig.apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': dataJson.length,
        }
    }, (res) => {
        var chunk = '';
        console.log(`STATUS: ${res.statusCode}`);

        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (data) => {
            chunk = chunk.concat(data)
            console.log(`BODY: ${data}`);
        });
        res.on('end', () => {
            const chunkJson = JSON.parse(chunk)
            if (chunkJson.status === 400) {
                callback(`[400] ${JSON.stringify(chunkJson.detail)}`);
            }
            console.log('No more data in response.');
            callback(null, {});
        });

    });

    req.on('error', (e) => {
        if (e) {
            callback(`[400] ${JSON.stringify(err)}`)
        }
    });

    req.write(dataJson);

    req.end();
}