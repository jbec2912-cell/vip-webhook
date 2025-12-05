// api/webhook.js  (Vercel / Next.js)  – direct to ElevenLabs agent
import twilio from 'twilio';

const ELEVENLABS_WEBHOOK = 'https://api.elevenlabs.io/v1/agents/910kb7fseq8ha51srdv/incoming-call';
// ↑↑↑↑ Replace with YOUR exact ElevenLabs incoming-call URL from the Phone Number tab ↑↑↑↑

export default function handler(req, res) {
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Directly proxy the call to your ElevenLabs agent
  twiml.redirect({
    method: 'POST'
  }, ELEVENLABS_WEBHOOK);

  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml.toString());
}

export const config = { api: { bodyParser: false } };
