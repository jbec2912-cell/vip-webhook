export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  console.log("Incoming Twilio webhook:", req.body);

  try {
    // Create a new ElevenLabs phone call session
    const session = await fetch(
      "https://api.elevenlabs.io/v1/convai/phone-calls/sessions",
      {
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
              twilio_account_sid: req.body.AccountSid,
              twilio_call_sid: req.body.CallSid,
            },
          },
        }),
      }
    );

    const data = await session.json();
    console.log("ElevenLabs session response:", data);

    // Tell Twilio to wait while ElevenLabs connects
    const twiml = `
      <Response>
        <Pause length="1" />
      </Response>
    `;

    res.setHeader("Content-Type", "text/xml");
    return res.status(200).send(twiml);
  } catch (err) {
    console.error("Error creating ElevenLabs session:", err);
    return res.status(500).send("Error");
  }
}
