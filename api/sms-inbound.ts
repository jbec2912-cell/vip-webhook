import { VercelRequest, VercelResponse } from "@vercel/node";
import Twilio from "twilio";

const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { Body: message = "", From: customerPhone } = req.body;
  const fromNumber = req.body.To; // your Twilio number

  const lower = message.toLowerCase();
  const isInterested = lower.includes("yes") || lower.includes("interested") || lower.includes("yeah");

  // 1. Reply to the customer
  let reply = "Thanks for your message! Brandon will follow up soon.";

  if (lower.includes("stop") || lower.includes("unsubscribe")) {
    reply = "You've been unsubscribed. Text START to resume. Have a great day!";
  } else if (isInterested) {
    reply = "Awesome! Brandon will call you shortly to set everything up. Excited to help!";
  }

  // Send reply back to customer
  await client.messages.create({
    body: reply,
    from: fromNumber,
    to: customerPhone,
  });

  // 2. Alert YOU instantly if they show interest
  if (isInterested) {
    await client.messages.create({
      body: `INTEREST ALERT from ${customerPhone}!\nMessage: "${message}"\nReply or call them now!`,
      from: fromNumber,
      to: process.env.MY_PERSONAL_NUMBER, // ← Your cell: +14075551234 (or whatever yours is)
    });
  }

  // Respond to Twilio with TwiML
  res.status(200).type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>${reply}</Message></Response>`);
}
