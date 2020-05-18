import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

import { FIREBASE_END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'DELETE') {
    const { query } = req;
    const { sessionId, user } = query;

    const leaveSessionEndpoint = FIREBASE_END_POINTS.leaveSession();
    await fetch(leaveSessionEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        displayName: user,
      }),
    });
    res.end();
  }
};

export default handler;
