import { NextRequest } from 'next/server';
import Twilio from 'twilio';

export const POST = async (req: NextRequest) => {
  const twiml = new Twilio.twiml.VoiceResponse();

  // Simple greeting so you know it's alive
  twiml.say({ voice: 'Polly.Joanna' }, "Hello, this is Brandon's VIP agent at Lakeland Toyota. Please hold while I connect you.");

  // Option A: Forward to your real cell (uncomment the number you want)
  twiml.dial("+1863XXXXXXX");  // put your real cell here

  // Option B: Just keep the call open for testing (uncomment if you want to hear the greeting and stay on)
  // twiml.pause({ length: 30 });

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
};
