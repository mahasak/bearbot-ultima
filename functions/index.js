const request = require('request')
const rp = require('request-promise')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const VERIFY_TOKEN = 'BEARBOT_VERIFIER';
const PAGE_ID = 2199911393591385;
admin.initializeApp(functions.config().firebase)

exports.version = functions.https.onRequest((request, response) => {
    response.send("Bearbot API - V.1.0.0")
})

exports.webhook = functions.https.onRequest((req, res) => {
    switch (req.method) {
        case 'GET':
            verifySubscription(req, res)
            break
        case 'POST':
            processMessage(req, res)
            break
    }

    res.sendStatus(200)
})

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

    if (pageScopeID != PAGE_ID) {

        const containerNode = admin.database().ref('/chats');

        containerNode.once('value', (snapshot) => {
            if(!snapshot.hasChild(pageScopeID)) {
                const options = {
                    method: 'GET',
                    uri: `https://graph.facebook.com/v3.1/${event.sender.id}`,
                    qs: {
                      access_token: process.env.pagetoken,
                      fields: `name,picture`
                    },
                    json: true
                };
        
                rp(options)
                    .then(fbRes => {
                        admin.database().ref('/chats').child(pageScopeID).set({
                                id: pageScopeID,
                                name: fbRes.name,
                                picture: fbRes.picture.data.url,
                                recipientID: recipientID,
                                timestamp: new Date().getTime()
                            }, 
                            ()=>{}
                        )
                    })
            } else {
                admin.database().ref('/chats').child(pageScopeID).update({
                        timestamp: new Date().getTime()
                    }, 
                    ()=>{}
                )
            }
        })
    }

    messageLogId = (pageScopeID === PAGE_ID) ? recipientID : pageScopeID,
    admin.database().ref(`/messages/${messageLogId}`).push({
            text: message.text,
            direction: (pageScopeID === PAGE_ID) ? 'send' : 'receive',
            timestamp: new Date().getTime()
        }, 
        ()=>{}
    )

    if (isEcho) {
        console.log(`Received echo for message ${messageId} and app ${appId} with metadata ${metadata}`)
        return
    } else if (quickReply) {
        const quickReplyPayload = quickReply.payload
        console.log(`Quick reply for message ${messageId} with payload ${quickReplyPayload}`)

        sendTextMessage(senderID, "Quick reply tapped")
        return
    }

    console.log(`Received message from ${pageScopeID} and page ${recipientID} with mesage ${message.text}`)
    markSeen(pageScopeID)

    // disable echo message
    //sendTextMessage(pageScopeID, message.text)
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

const callSendAPI = (messageData) => {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.pagetoken },
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
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error)
        }
    });
}

const callUserAPI = (userId) => {
    
}

const markSeen = (psid) => {
    console.log("Sending a read receipt to mark message as seen");

    var messageData = {
        recipient: {
            id: psid
        },
        sender_action: "mark_seen"
    }

    callSendAPI(messageData)
}