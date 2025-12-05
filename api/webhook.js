// app/api/webhook/route.js  ←  FINAL CODE – HUMAN-SOUNDING BRANDON (2025)

export async function POST(request) {
  const form = await request.formData();
  const params = Object.fromEntries(form);

  const CallSid = params.CallSid || "";
  const customerName = params.customerName || params.From?.slice(-10) || "there";
  const vehicle = params.vehicle || "your vehicle";

  // Fix the correct webhook URL so nothing 404s ever again
  const url = new URL(request.url);
  const webhookUrl = `${url.origin}/api/webhook`;

  // ─────────────────────────────
  // INBOUND CALL – someone calling you back
  // ─────────────────────────────
  if (!CallSid || CallSid.length < 10) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Brian" language="en-US">
    Hey, this is Brandon at Lakeland Toyota!
    Thanks for calling me back — I left you a message about your service visit today.
    Who am I speaking with real quick so I can pull up the right info?
  </Say>
  <Pause length="45"/>
  <Gather input="speech" action="${webhookUrl}" method="POST" speechTimeout="auto" timeout="30"/>
</Response>`, {
      headers: { "Content-Type": "text/xml" }
    });
  }

  // ─────────────────────────────
  // OUTBOUND + CONTINUED CONVERSATION
  // ─────────────────────────────
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Brian" language="en-US">Hi ${customerName}?</Say>
  <Pause length="1"/>
  <Say voice="Brian" language="en-US">Hey ${customerName}, this is Brandon at Lakeland Toyota.</Say>
  <Pause length="1"/>
  <Say voice="Brian" language="en-US">
    I see you’re bringing your ${vehicle} in for service… how’s it been treating you lately?
  </Say>
  <Pause length="45"/>
  <Gather input="speech" action="${webhookUrl}" method="POST" speechTimeout="auto" timeout="30"/>
</Response>`, {
    headers: { "Content-Type": "text/xml" }
  });
}
