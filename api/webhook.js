// api/webhook.js
export const config = { api: { bodyParser: false } };

import { buffer } from "micro";

export default async function handler(req, res) {
  // Twilio GET validation → return 200
  if (req.method === "GET") {
    return res.status(200).send("VIP Webhook is live");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const buf = await buffer(req);
  const payload = Object.fromEntries(new URLSearchParams(buf.toString()));

  try {
    await fetch("https://api.elevenlabs.io/v1/convai/phone-calls/sessions", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: process.env.ELEVENLABS_AGENT_ID,
        call_target: {
          platform: "twilio",
          twilio_connection_info: {
            twilio_account_sid: payload.AccountSid,
            twilio_call_sid: payload.CallSid,
          },
        },
      }),
    });

    const twiml = `<Response><Pause length="30"/></Response>`;
    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(twiml);
  } catch (err) {
    console.error(err);
    res.setHeader("Content-Type", "text/xml");
    res.status(500).send("<Response><Say>Sorry, something broke.</Say></Response>");
  }
}
