import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

import { FIREBASE_END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'POST') {
    const { query, body } = req;
    const { sessionId } = query;
    const { user } = JSON.parse(body);

    const joinSessionEndpoint = FIREBASE_END_POINTS.joinSession();
    const response = await fetch(joinSessionEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        user,
      }),
    });
    if (!response.ok) {
      const { error } = await response.json();
      res.status(response.status).send({ error });
    }
    res.end();
  }
};

export default handler;
