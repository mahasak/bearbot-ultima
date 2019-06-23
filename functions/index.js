const config = require('./config')
const admin = require('firebase-admin')
const functions = require('firebase-functions')
const request = require('request')
const rp = require('request-promise')

admin.initializeApp(functions.config().firebase)

exports.webhook = functions.https.onRequest((req, res) => {
    console.log(req)
    switch (req.method) {
        case 'GET':
            verifySubscription(req, res)
            break
        case 'POST':
            processMessage(req, res)
            break
    }
})

const verifySubscription = (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === config.facebook.validation_token) {
        console.log("Validating webhook")
        res.status(200).send(req.query['hub.challenge'])
    } else {
        console.error("Failed validation. Make sure the validation tokens match.")
        res.sendStatus(403)
    }
}

const processMessage = (req, res) => {
    const data = req.body;
    console.log('message receive')
    console.log(data)
    if (data.object == 'page') {
        data.entry.forEach(pageEntry => {
            const pageID = pageEntry.id
            const timeOfEvent = pageEntry.time

            pageEntry.messaging.forEach(function (event) {
                if (event.message) {
                    receivedMessage(event)
                } else {
                    console.log(`Webhook received unknown messagingEvent: ${event}`)
                }
            });
        });
    }
}

const receivedMessage = (event) => {
    console.log(event)
    
    
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
    
    console.log('processing message')

    messageLogId = (pageScopeID === config.facebook.page_id) ? recipientID : pageScopeID
    //markSeen(pageScopeID)
    if (!isEcho) {
        //sendTextMessage(event.sender.id, message.text)
        return
    }

    console.log(`Received message from ${pageScopeID} and page ${recipientID} with mesage ${message.text}`)
    
    
}

const markSeen = (psid) => {
    const messageData = {
        recipient: {
            id: psid
        },
        sender_action: "mark_seen"
    }

    callSendAPI(messageData)
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

const callSendAPI = (messageData) => {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: config.facebook.page_access_token },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
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
            console.log(response)
            console.error("Failed calling Send API", error)
        }
    });
}