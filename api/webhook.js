// vip-webhook/api/webhook.js   ← replace entire file with this

import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Optional: keep the GET check so you can still visit the URL in a browser
  if (req.method === 'GET') {
    return res.status(200).send('VIP Webhook is live');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // THIS IS THE FIX — return valid TwiML first
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Please wait while we connect your call.</Say>
  <!-- You can add more TwiML here later (Dial, Record, etc.) -->
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
