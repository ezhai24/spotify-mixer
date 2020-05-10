import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

exports.addTrackCounts = functions.https.onRequest(async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { sessionId, user, tracks } = JSON.parse(body);

    // Add trackCounts document for current user
    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('trackCounts').doc(user)
      .set({ tracks });

    // Update aggregate trackCounts
    const aggregate = await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('trackCounts').doc('aggregate')
      .get();
    const aggregateTrackCounts = aggregate.get('trackCounts');
    const aggregateTrackCountsKeys = Object.keys(aggregateTrackCounts);
    const trackCounts: Record<string, number> = {};
    tracks.forEach((track: string) => {
      trackCounts[track] = aggregateTrackCountsKeys.includes(track)
        ? aggregateTrackCounts[track] + 1
        : 1;
    });
    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('trackCounts').doc('aggregate')
      .set({
        userCount: admin.firestore.FieldValue.increment(1),
        trackCounts,
      }, { merge: true });
  }
  res.end();
});
