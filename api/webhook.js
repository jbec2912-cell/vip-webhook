// api/webhook.js  (must be .js, not .ts)

export async function POST(req) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    Hello, you have successfully reached Brandon’s VIP phone agent at Lakeland Toyota. Your call is live and working. Please hold for a moment to confirm everything is connected properly.
  </Say>
  <Pause length="60" />
</Response>`;

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

// Handle GET requests (Twilio sometimes pings with GET first)
export function GET() {
  return new Response('OK', { status: 200 });
}
