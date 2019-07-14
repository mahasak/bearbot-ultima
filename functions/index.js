const request = require('request')
const rp = require('request-promise')
const functions = require('firebase-functions')
const admin = require('firebase-admin')

import sendApi from './lib/send'
const VERIFY_TOKEN = 'BEARBOT_VERIFIER';
const PAGE_ID = 2199911393591385;
admin.initializeApp(functions.config().firebase)

exports.version = functions.https.onRequest((request, response) => {
    response.send("Bearbot API - V.2.0.0")
})

exports.webhook = functions.https.onRequest((req, res) => {
    const body = req.body
    if (body.object === 'page') {
        body.entry.forEach(function (entry) {

            // Get the webhook event. entry.messaging is an array, but 
            // will only ever contain one event, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        res.status(200).send('EVENT_RECEIVED');

    } else {
        res.sendStatus(404);
    }
})

const handleMessage = (sender_psid, received_message) => {
    let response;
    // Checks if the message contains text
    if (received_message.text) {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        response = {
            "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
        }
    } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }

    // Send the response message
    sendApi.sendMessage(sender_psid, response)
}

const handlePostback = (sender_psid, received_postback) => {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = { "text": "Thanks!" }
    } else if (payload === 'no') {
        response = { "text": "Oops, try sending another image." }
    }
    // Send the message to acknowledge the postback
    sendApi.sendMessage(sender_psid, response)
}

const SendMessage = (psid, response) => {
    let request_body = {
        recipient: {
            id: `${psid}`
        },
        message: response
    }

    CallMessengerAPI(request_body)
}

const SendAction = (psid, action) => {
    let request_body = {
        recipient: {
            id: psid
        },
        sender_action: action
    }
    api.callMessagesAPI([
        typingOn(psid),
        ...messagePayloadArray,
        typingOff(psid),
      ]);
    CallMessengerAPI(request_body)
}

const CallMessengerAPI = (request_body) => {
    request({
        uri: 'https://graph.facebook.com/v3.3/me/messages',
        qs: { access_token: functions.config().messenger_api.token },
        method: "POST",
        json: request_body
    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s",
                    messageId, recipientId)
            } else {
                console.log("Successfully called Send API for recipient %s",
                    recipientId)
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error)
        }
    })
}

const Getstart = (psid) => {
    let request_body = {
        "get_started": {
            "payload": {
                "persistent_menu": [
                    {
                        "locale": "default",
                        "composer_input_disabled": false,
                        "call_to_actions": [
                            {
                                "type": "postback",
                                "title": "Calculate BMI",
                                "payload": "LIVE_CALC_BMI"
                            }
                        ]
                    }
                ]
            }
        }
    }

    CallMessengerAPI(request_body)
}
