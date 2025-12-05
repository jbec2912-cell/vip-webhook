// api/webhook.ts   (or api/webhook.js)

import { NextRequest } from 'next/server';
import Twilio from 'twilio';

export const POST = async (req: NextRequest) => {
  const twiml = new Twilio.twiml.VoiceResponse();

  // Friendly greeting so you know the webhook is being hit
  twiml.say(
    { voice: 'Polly.Joanna', language: 'en-US' },
    'Hello, you have successfully reached Brandon’s VIP phone agent at Lakeland Toyota. Your call is live and working. Hold for a moment to confirm everything is connected properly.'
  );

  // Keep the call alive for 60 seconds (perfect for testing)
  twiml.pause({ length: 60 });

  // Optional: play a little hold music instead of silence (uncomment if you want)
  // twiml.play({
  //   loop: 10
  // }, 'https://raw.githubusercontent.com/twilio/twiml-music/main/holdmusic/bensound-ukulele.mp3');

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
};

// Twilio sometimes pings with GET first – this keeps Vercel happy
export const GET = () => new Response('OK', { status: 200 });
