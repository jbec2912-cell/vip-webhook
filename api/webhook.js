// /api/webhook.js – Twilio ONLY – works on Vercel (Dec 2025)
import { NextResponse } from "next/server";

export async function POST(request) {
  // Twilio always sends form-urlencoded → parse it safely
  const formData = await request.formData();
  const params = Object.fromEntries(formData);

  const CallSid = params.CallSid || "";
  const To = params.To || "";
  const From = params.From || "";
  const SpeechResult = params.SpeechResult || "";

  // Pass these in when you create the outbound call via Twilio REST API
  const customerName = params.customerName || "there";
  const vehicle = params.vehicle || "vehicle";

  // ─────────────────────────────────────────────
  // 1. INBOUND CALL – someone calling your Twilio number
  // ─────────────────────────────────────────────
  if (!CallSid || CallSid.length < 10) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="man" language="en-US">
    Hey, this is Brandon at Lakeland Toyota! Thanks for calling me back.
    I left you a message about your ${vehicle} coming in for service.
    Who am I speaking with real quick?
  </Say>
  <Pause length="20"/>
</Response>`;
    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ─────────────────────────────────────────────
  // 2. OUTBOUND CALL – first hit (no SpeechResult yet)
  // ─────────────────────────────────────────────
  if (!SpeechResult) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="3"/>
  <Gather input="speech" action="${request.url}" method="POST" speechTimeout="auto" timeout="6">
    <Say voice="man" language="en-US">Hi ${customerName}?</Say>
  </Gather>
  <Redirect>${request.url}</Redirect>
</Response>`;
    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ─────────────────────────────────────────────
  // 3. Speech detected – decide human vs voicemail
  // ─────────────────────────────────────────────
  const said = SpeechResult.toLowerCase().trim();

  const isVoicemail =
    said === "" ||
    said.length > 70 ||
    /leave.*message|not available|voicemail|mailbox|at the (tone|beep)|record your/i.test(said);

  if (isVoicemail) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="man" language="en-US">
    Hey ${customerName}, it’s Brandon, the VIP Director at Lakeland Toyota.
    I saw you’re coming in for service on your ${vehicle}.
    When you get checked in, come find me at desk 17 — I’ll show you real quick what your trade is worth right now.
    Takes two minutes, zero pressure. Looking forward to meeting you!
  Talk soon!
  </Say>
  <Hangup/>
</Response>`;
    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ─────────────────────────────────────────────
  // 4. HUMAN answered – run full Brandon script
  // ─────────────────────────────────────────────
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="man" language="en-US">Hi ${customerName}?</Say>
  <Pause length="1"/>
  <Say voice="man" language="en-US">Hey ${customerName}, this is Brandon at Lakeland Toyota.</Say>
  <Pause length="1"/>
  <Say voice="man" language="en-US">
    I see you’re bringing your ${vehicle} in for service… How’s it been treating you lately?
  </Say>
  <Pause length="30"/>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

// Twilio sometimes pings with GET
export async function GET() {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
    headers: { "Content-Type": "text/xml" },
  });
}

export const config = {
  api: {
    bodyParser: false, // crucial for Twilio form data
  },
};
