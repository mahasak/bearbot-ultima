const functions = require('firebase-functions')

const config = require('./config')
const admin = require('firebase-admin')
const functions = require('firebase-functions')
const rp = require('request-promise')

admin.initializeApp(functions.config().firebase)

exports.webhook = functions.https.onRequest((req, res) => {
    verifySubscription(req, res)

    res.sendStatus(200)
})

const verifySubscription = (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === config.validation_token) {
        console.log("Validating webhook")
        res.status(200).send(req.query['hub.challenge'])
    } else {
        console.error("Failed validation. Make sure the validation tokens match.")
        res.sendStatus(403)
    }
}