export default function handler(req, res) {
  if (req.method === "POST") {
    console.log("Incoming Twilio webhook:", req.body);

    const twiml = `
      <Response>
        <Say>Hello. Your webhook is working.</Say>
      </Response>
    `;

    res.setHeader("Content-Type", "text/xml");
    return res.status(200).send(twiml);
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
