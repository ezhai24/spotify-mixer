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

exports.endSession = functions.https.onRequest(async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { sessionId } = JSON.parse(body);
    await admin.firestore().collection('sessions').doc(sessionId).delete();
  }
  res.end();
});
