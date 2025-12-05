// api/webhook.js  ←  FINAL WORKING VERSION (Dec 2025)
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    // Safely extract fields (Vapi sometimes sends them in different places)
    const to = body.to || body.call?.to;
    const from = body.from || body.call?.from;
    const customerName = body.customerName || "there";
    const vehicle = body.vehicle || "vehicle";

    // INBOUND CALL (someone calling your agent number)
    if (to && !to.startsWith("client-")) {
      return NextResponse.json({
        messages: [
          {
            role: "assistant",
            content: `Hey, this is Brandon at Lakeland Toyota! Thanks for calling me back — I left you a message about your ${vehicle} coming in for service. Who am I speaking with so I can pull up the right info?`,
          },
        ],
      });
    }

    // OUTBOUND CALL (your agent calling the customer)
    return NextResponse.json({
      messages: [
        {
          role: "assistant",
          content: "",
          type: "silence",
          durationMs: 2600,
        },
      ],
      next: {
        type: "function",
        name: "detect_voicemail_or_human",
      },
      functions: [
        {
          name: "detect_voicemail_or_human",
          implementation: async ({ transcript = "" }) => {
            const t = transcript.toLowerCase().trim();

            const isVoicemail =
              t === "" ||
              t.length > 70 ||
              /leave.*message|not available|voicemail|at the tone|record your/i.test(t);

            if (isVoicemail) {
              return {
                messages: [
                  {
                    role: "assistant",
                    content: `Hey ${customerName}, it’s Brandon, the VIP Director at Lakeland Toyota. I saw you’re coming in for service on your ${vehicle} and wanted to reach out. When you get checked in, swing by desk 17 — I’ll show you real quick what your trade is worth today. Takes two minutes, no pressure at all. See you soon!`,
                  },
                ],
                endCall: true,
              };
            }

            // Human answered → normal Brandon script
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
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { messages: [{ role: "assistant", content: "Hey, this is Brandon at Lakeland Toyota!" }] },
      { status: 200 }
    );
  }
}

export const config = {
  api: { bodyParser: true };
