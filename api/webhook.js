// /api/webhook.js
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { direction, to, from, callSid, customerName = "there", vehicle = "vehicle" } = body;

  // ─────────────────────────────────────────────────────────────
  // 1. INBOUND CALL (someone calling the agent number back)
  // ─────────────────────────────────────────────────────────────
  if (direction === "inbound" || to === process.env.PHONE_NUMBER) {
    return NextResponse.json({
      messages: [
        {
          role: "assistant",
          content: `Hey, this is Brandon at Lakeland Toyota! Thanks for calling me back — I left you a quick message about your ${vehicle} coming in for service. Is this ${customerName}?`,
        },
      ],
      // Continue the normal conversation flow after this
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 2. OUTBOUND CALL – Brandon’s perfect script with voicemail detection
  // ─────────────────────────────────────────────────────────────
  return NextResponse.json({
    // First 2.5 seconds of silence so we can detect human vs voicemail
    messages: [
      {
        role: "assistant",
        content: "",
        type: "silence",
        durationMs: 2500,
      },
    ],

    // This function runs on the server after the silence
    next: {
      type: "function",
      name: "decide_next_step",
      parameters: {
        type: "object",
        properties: {},
      },
    },

    functions: [
      {
        name: "decide_next_step",
        description: "Decide if we heard a human greeting or voicemail",
        parameters: { type: "object", properties: {} },
        implementation: async ({ transcript }) => {
          const lower = (transcript || "").toLowerCase().trim();

          // Voicemail indicators
          const isVoicemail =
            transcript === "" ||
            lower.includes("leave a message") ||
            lower.includes("not available") ||
            lower.includes("at the beep") ||
            lower.includes("voicemail") ||
            lower.includes("record your message") ||
            lower.length > 80; // long automated greeting

          if (isVoicemail) {
            return {
              messages: [
                {
                  role: "assistant",
                  content: `Hey ${customerName}, it’s Brandon, the VIP Director over here at Lakeland Toyota. I saw you’re coming in for service on your ${vehicle} and just wanted to reach out personally. When you get checked in, come find me at desk 17 — I’ll show you real quick what your trade is worth right now and what your options look like. Takes two minutes, zero pressure. Looking forward to meeting you! Talk soon.`,
                },
              ],
              // Instantly hang up after voicemail
              endCall: true,
            };
          }

          // Human answered – start the real script
          return {
            messages: [
              {
                role: "assistant",
                content: `Hi ${customerName}?`,
                type: "speech",
              },
              {
                role: "assistant",
                content: `Hey ${customerName}, this is Brandon at Lakeland Toyota.`,
              },
              {
                role: "assistant",
                content: `I see that you are bringing your ${vehicle} in for service… How’s it been treating you lately?`,
              },
            ],
          };
        },
      },
    ],
  });
}
