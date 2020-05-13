import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

exports.addTopCounts = functions.https.onRequest(async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { sessionId, user, artists } = JSON.parse(body);

    // Add artistCounts document for current user
    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('topCounts').doc(user)
      .set({ artists });

    // Update aggregate artistCounts
    const aggregate = await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('topCounts').doc('aggregate')
      .get();
    const aggregateArtistCounts = aggregate.get('artistCounts');
    const aggregateArtistCountsKeys = Object.keys(aggregateArtistCounts);
    const artistCounts: Record<string, number> = {};
    artists.forEach((artist: string) => {
      artistCounts[artist] = aggregateArtistCountsKeys.includes(artist)
        ? aggregateArtistCounts[artist] + 1
        : 1;
    });
    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .collection('topCounts').doc('aggregate')
      .update({ artistCounts });

    // Update user count
    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .update({
        userCount: admin.firestore.FieldValue.increment(1),
      });

    res.end();
  }
});

exports.createPlaylist = functions.https.onRequest(async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    const { sessionId, playlist } = JSON.parse(body);
    await admin.firestore()
      .collection('sessions').doc(sessionId)
      .update({ playlist });
    res.end();
  }
});
