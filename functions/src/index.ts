import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase)

exports.version = functions.https.onRequest((request, response) => {
    response.send("Bearbot API - V.1.0.0");
});

exports.webhookMessenger = functions.https.onRequest((request, response) => {
    response.send("WEBHOOK");
})