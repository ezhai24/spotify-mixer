import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const clientTools = require('firebase-tools');

exports.createSession = functions.https.onRequest(async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    // Create session
    const session = await admin.firestore()
      .collection('sessions')
      .add({
        users: [],
      });
    
    // Create trackCounts subcollection with empty aggregate document
    const { id: sessionId } = session;
    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('topCounts').doc('aggregate')
      .set({
        artistCounts: {},
      });
    
    res.send({ sessionId });
  }
});

exports.joinSession = functions.https.onRequest(async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { sessionId, user } = JSON.parse(body);

    const session = await admin.firestore()
      .collection('sessions').doc(sessionId)
      .get();

    if (!session.exists) {
      res.status(404).send({
        error: 'We could not find a session with this ID',
      });
    }

    const sessionUsers = session.get('users');
    if (sessionUsers.includes(user)) {
      res.status(403).send({
        error: 'A user with this name has already joined this session',
      });
    }

    res.end();
  }
});

exports.leaveSession = functions.https.onRequest(async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { displayName, sessionId } = JSON.parse(body);

    // Remove user's top counts from aggregates
    const userTops = await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('topCounts').doc(displayName)
      .get();
    const userTopArtists = userTops.get('artists');

    const aggregate = await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('topCounts').doc('aggregate')
      .get();
    const artistCounts = aggregate.get('artistCounts');
    
    userTopArtists.forEach((artist: string) => {
      artistCounts[artist] = artistCounts[artist] - 1;
      if (artistCounts[artist] === 0) {
        delete artistCounts[artist];
      };
    });

    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('topCounts').doc('aggregate')
      .update({ artistCounts });

    // Remove user from session
    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .update({
        users: admin.firestore.FieldValue.arrayRemove(displayName),
      });

    // Remove user's top counts document
    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('topCounts').doc(displayName)
      .delete();
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
