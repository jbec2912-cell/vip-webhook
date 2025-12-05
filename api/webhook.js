// /api/webhook.js – Bulletproof Vapi + Vercel (Dec 2025)
import { NextResponse } from "next/server";

export async function POST(req) {
  let body;
  try {
    // Safe parse: Try JSON first, fallback to form data (Vapi/Twilio sometimes sends x-www-form-urlencoded)
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      // Parse form data if not JSON
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }
    console.log('Vapi Body Received:', JSON.stringify(body)); // Log for debugging
  } catch (parseError) {
    console.error('Parse Error:', parseError);
    body = {}; // Fallback empty body
  }

  // Safe field extraction (Vapi inbound often nests in 'call' or sends Twilio params)
  const to = (body.to || body.call?.to || body.Called || '').toString();
  const from = (body.from || body.call?.from || body.Caller || '').toString();
  const direction = body.direction || (to && !to.startsWith('client-') ? 'inbound' : 'outbound');
  const customerName = body.customerName || body.name || 'there';
  const vehicle = body.vehicle || 'vehicle';

  // INBOUND: Someone calling your number – answer immediately
  if (direction === 'inbound' || (!from.startsWith('client-') && to)) {
    console.log('Inbound detected – Brandon answering');
    return NextResponse.json({
      success: true,
      messages: [
        {
          role: 'assistant',
          content: `Hey, this is Brandon at Lakeland Toyota! Thanks for calling back – I left a message about your ${vehicle} service visit. Is this ${customerName}, or who am I speaking with?`,
        },
      ],
    }, { status: 200 });
  }

  // OUTBOUND: Agent calling customer – silence + voicemail detect
  console.log('Outbound detected – starting silence');
  return NextResponse.json({
    success: true,
    messages: [
      {
        role: 'assistant',
        content: '',
        type: 'silence',
        durationMs: 2600,
      },
    ],
    next: {
      type: 'function',
      name: 'detect_voicemail_or_human',
    },
    functions: [
      {
        name: 'detect_voicemail_or_human',
        implementation: async ({ transcript = '' }) => {
          const t = transcript.toLowerCase().trim();
          console.log('Transcript for detection:', t); // Log for debug

          const isVoicemail =
            t === '' ||
            t.length > 70 ||
            /leave.*message|not available|voicemail|at the (tone|beep)|record your/i.test(t) ||
            /please leave|unavailable|mailbox/i.test(t); // Extra patterns

          if (isVoicemail) {
            console.log('Voicemail detected – leaving message + hangup');
            return {
              messages: [
                {
                  role: 'assistant',
                  content: `Hey ${customerName}, it's Brandon, the VIP Director at Lakeland Toyota. I saw you're coming in for service on your ${vehicle} and wanted to reach out personally. When you get checked in, come find me at desk 17 – I'll show you real quick what your trade is worth right now and what options look like. Takes two minutes, zero pressure. Looking forward to meeting you! Talk soon.`,
                },
              ],
              endCall: true,
            };
          }

          // Human – run Brandon's script
          console.log('Human detected – starting rapport');
          return {
            messages: [
              { role: 'assistant', content: `Hi ${customerName}?` },
              { role: 'assistant', content: `Hey ${customerName}, this is Brandon at Lakeland Toyota.` },
              { role: 'assistant', content: `I see that you're bringing your ${vehicle} in for service… How's it been treating you lately?` },
            ],
          };
        },
      },
    ],
  }, { status: 200 });
}

// Graceful config for Vercel
export const config = {
  api: { bodyParser: false }, // Disable built-in parser – we handle it manually
  runtime: 'edge', // Optional: Faster on Vercel
};
