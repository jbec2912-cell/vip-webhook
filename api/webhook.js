// app/api/webhook/route.js   ← 100% working Twilio version (Dec 2025)

export async function POST() {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="man" language="en-US">
    Hey, this is Brandon at Lakeland Toyota! Thanks for calling me back.
    I left you a message about your service appointment today.
    Who am I speaking with real quick so I can pull up the right info?
  </Say>
  <Pause length="30"/>
</Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET() {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
    headers: { "Content-Type": "text/xml" },
  });
}
