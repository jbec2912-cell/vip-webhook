// pages/api/webhook.js   (or wherever your webhook lives)

import twilio from 'twilio';

// Load the number you want to forward to from environment variables
// Set this in Vercel dashboard → Settings → Environment Variables
// Name: FORWARD_TO_NUMBER   Value: +15551234567  (your real number, with country code)
const FORWARD_TO = process.env.FORWARD_TO_NUMBER;

export default function handler(req, res) {
  // Basic security – optional but recommended
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioSignature = req.headers['x-twilio-signature'];
  const url = `${req.headers.origin || 'https://yourdomain.com'}${req.url}`;

  // Uncomment the two lines below if you want to validate the request is really from Twilio
  // const isValid = twilio.validateRequest(authToken, twilioSignature, url, req.body);
  // if (!isValid) return res.status(403).send('Invalid Twilio signature');

  if (!FORWARD_TO) {
    return res.status(500).send('Server misconfigured: missing FORWARD_TO_NUMBER');
  }

  const twiml = new twilio.twiml.VoiceResponse();

  // Optional greeting before transferring
  twiml.say({
    voice: 'Polly.Joanna', // or any voice you prefer
  }, 'Thank you for calling. Please wait while we connect you to a representative.');

  // This is the actual transfer / forward
  twiml.dial({
    callerId: req.body.Caller || process.env.TWILIO_CALLER_ID, // keeps your Twilio number as caller ID
    timeout: 30,
    timeLimit: 3600, // 1 hour max, adjust as needed
  }, FORWARD_TO);

  // If the forward fails (busy, no answer, etc.)
  twiml.say('We could not connect you right now. Please try again later. Goodbye.');
  twiml.hangup();

  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml.toString());
}

// For Vercel – make sure this file is inside /pages/api or /api folder
export const config = {
  api: {
    bodyParser: true,
  },
};
