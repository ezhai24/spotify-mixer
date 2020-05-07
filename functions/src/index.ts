import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.createSession = functions.https.onCall(async (data) => {
  const { displayName } = data;
  const session = await admin.firestore().collection('sessions').add({
    users: [displayName],
  });
  return {
    sessionId: session.id,
  };
});
