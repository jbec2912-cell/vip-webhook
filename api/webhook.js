// app/api/webhook/route.js – FINAL Brandon (perfect voice + full logic)

export async function POST(request) {
  const form = await request.formData();
  const params = Object.fromEntries(form);

  const CallSid      = params.CallSid || "";
  const SpeechResult = params.SpeechResult || "";
  const customerName = params.customerName || "there";
  const vehicle      = params.vehicle || "vehicle";

  // INBOUND CALL (someone calling the dealership number)
  if (!CallSid) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Brian" language="en-US">
    Hey, this is Brandon at Lakeland Toyota! Thanks for calling me back.
    I left you a message about your ${vehicle} coming in for service.
    Who am I speaking with real quick so I can pull everything up?
  </Say>
  <Pause length="30"/>
</Response>`;
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  // OUTBOUND CALL – first hit (no speech yet) → 3-second silence to detect human/voicemail
  if (!SpeechResult) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="3"/>
  <Gather input="speech" action="${request.url.origin}${request.url.pathname}" method="POST" speechTimeout="auto" timeout="6">
    <Say voice="Brian" language="en-US">Hi ${customerName}?</Say>
  </Gather>
  <Redirect>${request.url.origin}${request.url.pathname}</Redirect>
</Response>`;
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  // Speech was captured → decide if human or voicemail
  const said = SpeechResult.toLowerCase().trim();
  const isVoicemail = 
    said === "" ||
    said.length > 70 ||
    /leave.*message|not available|voicemail|mailbox|tone|beep|record your/i.test(said);

  if (isVoicemail) {
    // VOICEMAIL → leave message and hang up instantly
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Brian" language="en-US">
    Hey ${customerName}, it’s Brandon, the VIP Director at Lakeland Toyota.
    Saw you’re coming in for service on your ${vehicle}.
    When you get checked in, come find me at desk seventeen — I’ll show you what your trade is worth right now.
    Takes two minutes, zero pressure. Looking forward to meeting you!
  </Say>
  <Hangup/>
</Response>`;
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  // HUMAN answered → full warm Brandon script
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Brian" language="en-US">Hi ${customerName}?</Say>
  <Pause length="1"/>
  <Say voice="Brian" language="en-US">Hey ${customerName}, this is Brandon at Lakeland Toyota.</Say>
  <Pause length="1"/>
  <Say voice="Brian" language="en-US">
    I see you’re bringing your ${vehicle} in for service… how’s it been treating you lately?
  </Say>
  <Pause length="45"/>
</Response>`;

  return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
}
