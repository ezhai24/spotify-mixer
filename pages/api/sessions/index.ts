import { NextApiRequest, NextApiResponse } from 'next';
import { FIREBASE_END_POINTS } from '~/shared/endpoints';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'POST') {
    const { body } = req;
    // const { user } = JSON.parse(body);
    const user = "Zhai";

    const createSessionEndpoint = FIREBASE_END_POINTS.createSession();
    await fetch(createSessionEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        user,
      }),
    });
    // const response = await fetch(createSessionEndpoint, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     user,
    //   }),
    // });
    // const session = await response.json();
    // res.send({ sessionId: session.sessionId });

    res.send({ sessionId: 'aqMhQ6rDApjI0wVp1wL6' });
  }
};

export default handler;
