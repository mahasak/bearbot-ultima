const castArray = require('lodash/castArray')
const isEmpty = require('lodash/isEmpty')
const request = require('request')
const rp = require('request-promise')
const functions = require('firebase-functions')

const PAGE_ACCESS_TOKEN = functions.config().messenger_api.token;

const callAPI = (endPoint, messageDataArray, queryParams = {}, retries = 5) => {
    if (!endPoint) {
        console.error('callAPI requires you specify an endpoint.');
        return;
    }

    if (retries < 0) {
        console.error(
            'No more retries left.',
            { endPoint, messageDataArray, queryParams }
        );

        return;
    }


    const query = Object.assign({ access_token: PAGE_ACCESS_TOKEN }, queryParams);
    const [messageToSend, ...queue] = castArray(messageDataArray);
    request({
        uri: `https://graph.facebook.com/v3.2/me/${endPoint}`,
        qs: query,
        method: 'POST',
        json: messageToSend,

    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            // Message has been successfully received by Facebook.
            console.log(
                `Successfully sent message to ${endPoint} endpoint: `,
                JSON.stringify(body)
            );

            // Continue sending payloads until queue empty.
            if (!isEmpty(queue)) {
                callAPI(endPoint, queue, queryParams);
            }
        } else {
            // Message has not been successfully received by Facebook.
            console.error(
                `Failed calling Messenger API endpoint ${endPoint}`,
                response.statusCode,
                response.statusMessage,
                body.error,
                queryParams
            );

            // Retry the request
            console.error(`Retrying Request: ${retries} left`);
            callAPI(endPoint, messageDataArray, queryParams, retries - 1);
        }
    });
};

const callMessagesAPI = (messageDataArray, queryParams = {}) => {
    return callAPI('messages', messageDataArray, queryParams);
};

const callMessengerProfileAPI = (messageDataArray, queryParams = {}) => {
    return callAPI('messenger_profile', messageDataArray, queryParams);
};

module.exports =  {
    callMessagesAPI,
    callMessengerProfileAPI,
};