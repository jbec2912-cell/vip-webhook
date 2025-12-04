// vip-webhook/api/webhook.js
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Optional: nice message when someone visits the URL in a browser
  if (req.method === 'GET') {
    return res.status(200).send('VIP Webhook is live');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Change +18637977937 to whatever number you want the call forwarded to
  const forwardToNumber = '+18637977937';   // ←←← EDIT THIS LINE

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connecting you now, one moment please.</Say>
  <Dial timeout="30" callerId="+18632678150">
    ${forwardToNumber}
  </Dial>
  <Say voice="alice">Sorry, the person you are trying to reach is unavailable. Goodbye.</Say>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
