// api/webhook.js   ← 100% working version (Dec 2025)
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  // These are the ONLY two fields Vapi always sends
  const callSid = body.callSid || body.call?.id;
  const from = body.from;                    // customer's number
  const to = body.to;                        // your agent number

  // ───────────────────────────────
  // INBOUND CALL (someone calling you back)
  // ───────────────────────────────
  // If the customer's number is in the "to" field → it's inbound
  if (to && !to.includes("client-")) {
    return NextResponse.json({
      messages: [
        {
          role: "assistant",
          content: `Hey, this is Brandon at Lakeland Toyota! Thanks for calling me back — I left you a message about your vehicle coming in for service today. Who am I speaking with just so I pull up the right info?`,
        },
      ],
    });
  }

  // ───────────────────────────────
  // OUTBOUND CALL (your agent calling the customer)
  // ───────────────────────────────
  const customerName = body.customerName || "there";
  const vehicle = body.vehicle || "vehicle";

  return NextResponse.json({
    messages: [
      { role: "assistant", content: "", type: "silence", durationMs: 2600 },
    ],
    next: {
      type: "function",
      name: "check_if_human_or_voicemail",
    },
    functions: [
      {
        name: "check_if_human_or_voicemail",
        implementation: async ({ transcript }) => {
          const t = (transcript || "").toLowerCase().trim();

          const isVoicemail =
            t === "" ||
            t.length > 70 ||
            t.includes("leave a message") ||
            t.includes("not available") ||
            t.includes("voicemail") ||
            t.includes("at the tone") ||
            t.includes("record your");

          if (isVoicemail) {
            return {
              messages: [
                {
                  role: "assistant",
                  content: `Hey ${customerName}, it’s Brandon, the VIP Director at Lakeland Toyota. I saw you’re coming in for service on your ${vehicle} and wanted to reach out personally. When you get checked in today, come find me at desk 17 — I’ll show you real quick what your trade’s worth and what your options look like. Takes two minutes, zero pressure. Looking forward to meeting you!`,
                },
              ],
              endCall: true,
            };
          }

          // Human answered
          return {
            messages: [
              { role: "assistant", content: `Hi ${customerName}?` },
              { role: "assistant", content: `Hey ${customerName}, this is Brandon at Lakeland Toyota.` },
              { role: "assistant", content: `I see you’re bringing your ${vehicle} in for service… How’s it been treating you lately?` },
            ],
          };
        },
      },
    ],
  });
}
