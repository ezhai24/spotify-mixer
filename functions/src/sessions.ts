import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const clientTools = require('firebase-tools');

exports.createSession = functions.https.onCall(async (data) => {
  const { displayName } = data;

  // Create session
  const session = await admin.firestore()
    .collection('sessions')
    .add({ users: [displayName] });
  
  // Create trackCounts subcollection with empty aggregate document
  const { id: sessionId } = session;
  await admin.firestore()
    .collection('sessions').doc(sessionId)
    .collection('topCounts').doc('aggregate')
    .set({
      userCount: 0,
      artistCounts: {},
    });
  
  return {
    sessionId,
  };
});

exports.joinSession = functions.https.onCall(async (data) => {
  const { displayName, sessionId } = data;

  const session = await admin.firestore()
    .collection('sessions').doc(sessionId)
    .get();
  const sessionUsers = session.get('users');
  if (sessionUsers.includes(displayName)) {
    throw new functions.https.HttpsError(
      'already-exists',
      'A user with this name has already joined this session',
    );
  }

  await admin.firestore()
    .collection('sessions').doc(sessionId)
    .update({
      users: admin.firestore.FieldValue.arrayUnion(displayName),
    });

  return null;
});

exports.leaveSession = functions.https.onRequest(async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { displayName, sessionId } = JSON.parse(body);
    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .update({
        users: admin.firestore.FieldValue.arrayRemove(displayName),
      });
  }
  res.end();
});

exports.endSession = functions.https.onRequest(async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { sessionId } = JSON.parse(body);
    clientTools.firestore
      .delete(`sessions/${sessionId}`, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        token: functions.config().fb.token,
      });
  }
  res.end();
});
