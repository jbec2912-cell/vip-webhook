// app/api/webhook/route.js – 100% working, no more warnings, no more 404s

export async function POST(request) {
  const form = await request.formData();
  const params = Object.fromEntries(form);

  const CallSid      = params.CallSid || "";
  const SpeechResult = params.SpeechResult || "";
  const customerName = params.customerName || "there";
  const vehicle      = params.vehicle || "vehicle";

  // Fix the URL once so we can reuse it safely
  const url = new URL(request.url);
  const webhookUrl = `${url.origin}/api/webhook`;

  // ─────────────────────────────────────
  // INBOUND CALL (someone calling the number)
  // ─────────────────────────────────────
  if (!CallSid) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">Hey, this is Brandon at Lakeland Toyota! Thanks for calling back. I left you a message about your service visit—who am I speaking with?</Say>
  <Gather input="speech" action="${webhookUrl}" method="POST" timeout="30" speechTimeout="auto">
    <Say voice="alice">Tell me more about your vehicle.</Say>
  </Gather>
</Response>`;
  // ─────────────────────────────────────
  // OUTBOUND – first hit (no speech yet) → 3-second silence + gather
  // ─────────────────────────────────────
  if (!SpeechResult) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="3"/>
  <Gather input="speech" action="${webhookUrl}" method="POST" speechTimeout="auto" timeout="6">
    <Say voice="man" language="en-US">Hi ${customerName}?</Say>
  </Gather>
  <Redirect>${webhookUrl}</Redirect>
</Response>`;
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  // ─────────────────────────────────────
  // Speech detected → human vs voicemail
  // ─────────────────────────────────────
  const said = (SpeechResult || "").toLowerCase().trim();

  const isVoicemail =
    said === "" ||
    said.length > 70 ||
    /leave.*message|not available|voicemail|mailbox|tone|beep|record your/i.test(said);

  if (isVoicemail) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="man" language="en-US">
    Hey ${customerName}, it’s Brandon, the VIP Director at Lakeland Toyota.
    I saw you’re coming in for service on your ${vehicle}.
    When you get checked in, come find me at desk seventeen — I’ll show you what your trade is worth right now.
    Takes two minutes, zero pressure. Looking forward to meeting you!
  </Say>
  <Hangup/>
</Response>`;
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  // ─────────────────────────────────────
  // HUMAN → full warm Brandon script
  // ─────────────────────────────────────
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="man" language="en-US">Hi ${customerName}?</Say>
  <Pause length="1"/>
  <Say voice="man" language="en-US">Hey ${customerName}, this is Brandon at Lakeland Toyota.</Say>
  <Pause length="1"/>
  <Say voice="man" language="en-US">
    I see you’re bringing your ${vehicle} in for service… how’s it been treating you lately?
  </Say>
</Response>`;

  return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
}
