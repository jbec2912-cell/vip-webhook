// api/webhook.js  ← silent instant transfer (final version)

export async function POST() {
  const elevenLabsUrl = "https://api.elevenlabs.io/v1/agents/9101kbd7h5f6egj8sha516tsrdv9/incoming-call";

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect method="POST">${elevenLabsUrl}</Redirect>
</Response>`;

  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

export function GET() {
  return new Response("OK", { status: 200 });
}
