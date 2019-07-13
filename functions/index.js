const request = require('request')
const rp = require('request-promise')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
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
    SendAction(sender_psid, 'mark_seen');
    SendAction(sender_psid, 'type_on');
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
    callSendAPI(sender_psid, response);
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
    let message_body = {
        recipient: {
            id: `${psid}`
        },
        message: response
    }

    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, message_body);
}

const callSendAPI = (message_body) => {
    console.log(message_body);
     
    request({
        uri: 'https://graph.facebook.com/v3.3/me/messages',
        qs: { access_token: functions.config().messenger_api.token },
        method: "POST",
        json: message_body
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

const SendAction = (psid, action) => {
    console.log("Sending a read receipt to mark message as seen");

    var message_body = {
        recipient: {
            id: psid
        },
        sender_action: action
    }
    callSendAPI(psid, message_body)
}


const verifySubscription = (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VERIFY_TOKEN) {
        console.log("Validating webhook")
        res.status(200).send(req.query['hub.challenge'])
    } else {
        console.error("Failed validation. Make sure the validation tokens match.")
        res.sendStatus(403)
    }
}

const processMessage = (req, res) => {
    const data = req.body;

    if (data.object == 'page') {
        data.entry.forEach(pageEntry => {
            const pageID = pageEntry.id
            const timeOfEvent = pageEntry.time

            pageEntry.messaging.forEach(function (event) {
                if (event.message) {
                    receivedMessage(event)
                } else if (event.delivery) {
                    receivedDeliveryConfirmation(event)
                } else if (event.postback) {
                    receivedPostback(event)
                } else if (event.read) {
                    receivedMessageRead(event)
                } else if (event.account_linking) {
                    receivedAccountLink(event)
                } else {
                    console.log(`Webhook received unknown messagingEvent: ${event}`)
                }
            });
        });
    }
}

const receivedMessage = (event) => {
    const pageScopeID = event.sender.id
    const recipientID = event.recipient.id
    const message = event.message
    const isEcho = message.is_echo
    const messageId = message.mid
    const appId = message.app_id
    const metadata = message.metadata
    const messageText = message.text
    const messageAttachments = message.attachments
    const quickReply = message.quick_reply

    if (isEcho) {
        console.log(`Received echo for message ${messageId} and app ${appId} with metadata ${metadata}`)
        return
    } else if (quickReply) {
        const quickReplyPayload = quickReply.payload
        console.log(`Quick reply for message ${messageId} with payload ${quickReplyPayload}`)

        sendTextMessage(senderID, "Quick reply tapped")
        return
    } else {
        sendTextMessage(pageScopeID, message.text)
    }

    console.log(`Received message from ${pageScopeID} and page ${recipientID} with mesage ${message.text}`)
    markSeen(pageScopeID)

}

const receivedDeliveryConfirmation = (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const delivery = event.delivery
    const messageIDs = delivery.mids
    const watermark = delivery.watermark
    const sequenceNumber = delivery.seq

    if (messageIDs) {
        messageIDs.forEach((messageID) => {
            console.log(`Received delivery confirmation for message ID: ${messageID}`)
        })
    }

    console.log(`All message before ${watermark} were delivered.`)
}

const receivedMessageRead = (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id

    // All messages before watermark (a timestamp) or sequence have been seen.
    const watermark = event.read.watermark
    const sequenceNumber = event.read.seq

    console.log(`Received message read event for watermark ${watermark} and sequence number ${sequenceNumber}`)
}

const sendTextMessage = (recipientId, messageText) => {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    }

    callSendAPI(messageData)
}



