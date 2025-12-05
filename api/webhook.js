// api/webhook.js – FIXED: Direct speech forwarding to ElevenLabs (no redirect)
const twilio = require('twilio');  // Use require for Vercel compatibility

const ELEVENLABS_WEBHOOK = process.env.ELEVENLABS_WEBHOOK || 'https://api.elevenlabs.io/v1/agents/910kb7fseq8ha51srdv/incoming-call';
// ↑ Set this as ENV VAR in Vercel for safety (or hardcode for now)

module.exports = async (req, res) => {
  try {
    // Log for debugging – check Vercel logs after a test call
    console.log('Webhook hit:', { From: req.body.From, To: req.body.To, CallSid: req.body.CallSid });

    const twiml = new twilio.twiml.VoiceResponse();

    // Quick greeting (customize or remove)
    twiml.say({
      voice: 'Polly.Joanna-Neural',  // Natural voice
      language: 'en-US'
    }, 'Hello, thanks for calling Brandon\'s agent. How can I assist you?');

    // Gather speech and POST to ElevenLabs for agent handling
    const gather = twiml.gather({
      input: 'speech',  // Speech-to-text
      action: ELEVENLABS_WEBHOOK,  // Your agent processes the input
      method: 'POST',
      timeout: 10,
      speechTimeout: 'auto',
      speechModel: 'phone_call',  // Optimized for calls
      hints: 'billing, appointment, support, question',  // Helps accuracy
      language: 'en-US'
    });

    // If no input, loop back or end
    gather.say('Sorry, I didn\'t hear that. Let\'s try again.');
    gather.redirect({ method: 'POST' }, '/api/webhook');  // Self-loop for retry

    // Safety hangup
    twiml.hangup();

    res.set('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
  } catch (error) {
    console.error('Webhook error:', error);
    // Emergency TwiML if code breaks
    res.set('Content-Type', 'text/xml');
    res.status(200).send(`
      <Response>
        <Say voice="Polly.Joanna">Oops, technical hiccup. Please call back in a moment.</Say>
        <Hangup/>
      </Response>
    `);
  }
};
