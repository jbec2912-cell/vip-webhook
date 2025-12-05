// api/webhook.js (Vercel / Next.js) – direct to ElevenLabs agent
import twilio from 'twilio';

const ELEVENLABS_WEBHOOK = 'https://api.elevenlabs.io/v1/agents/910kb7fseq8ha51srdv/incoming-call';
// ↑↑↑↑ Replace with YOUR exact ElevenLabs incoming-call URL ↑↑↑↑

export default function handler(req, res) {
  try {
    const twiml = new twilio.twiml.VoiceResponse();

    // Log incoming call details (optional – for debugging in Vercel logs)
    console.log('Incoming call:', {
      From: req.body.From,
      To: req.body.To,
      CallSid: req.body.CallSid,
    });

    // Instead of redirect (which can fail), use <Say> + <Gather> to start interaction,
    // then post to ElevenLabs for the real agent handling
    twiml.say({
      voice: 'Polly.Joanna-Neural', // Or your preferred voice
    }, 'Hello, thanks for calling. How can I help you today?');

    const gather = twiml.gather({
      input: 'speech',
      action: ELEVENLABS_WEBHOOK,  // This posts speech input directly to your agent
      method: 'POST',
      timeout: 10,
      speechTimeout: 'auto',
      hints: 'billing, appointment, support', // Optional: Helps speech recognition
    });

    // Fallback if no speech detected
    gather.say('I didn\'t catch that. Let me connect you to the agent.');
    gather.redirect(ELEVENLABS_WEBHOOK);

    // Hangup on error
    twiml.hangup();

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send(`
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Joanna">Sorry, we hit a snag. Please try again.</Say>
        <Hangup/>
      </Response>
    `);
  }
}

export const config = {
  api: {
    bodyParser: true,  // Enable this to parse Twilio's POST body
  },
};
