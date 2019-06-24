import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import {version} from './controllers/version';
import {webhook} from './controllers/webhook';
admin.initializeApp(functions.config().firebase)

// Firestore settings.
const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

exports.version = functions.https.onRequest(version);
exports.webhookMessenger = functions.https.onRequest(webhook);