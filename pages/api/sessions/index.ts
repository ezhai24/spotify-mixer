import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

import { FIREBASE_END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'POST') {
    const createSessionEndpoint = FIREBASE_END_POINTS.createSession();
    const response = await fetch(createSessionEndpoint, { method: 'POST' });
    const session = await response.json();
    res.send({ sessionId: session.sessionId });
  }
};

export default handler;
