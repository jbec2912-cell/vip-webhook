// api/webhook.js  ← final production-ready version

export async function POST(req) {
  const elevenLabsUrl = "https://api.elevenlabs.io/v1/agents/9101kbd7h5f6egj8sha516tsrdv9/incoming-call";

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    Thank you for calling Lakeland Toyota. Connecting you to our VIP assistant now.
  </Say>
  <Redirect method="POST">${elevenLabsUrl}</Redirect>
</Response>`;

  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

export function GET() {
  return new Response("OK", { status: 200 });
}
