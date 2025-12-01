// api/sms-inbound.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Twilio from 'twilio';

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const message = (req.body.Body as string) ?? '';
  const customerPhone = req.body.From as string;
  const fromNumber = req.body.To as string;

  const lower = message.toLowerCase();
  const isInterested = /yes|interested|yeah|yep|sure|let's go/i.test(lower);

  let reply = "Thanks for your message! Brandon will follow up soon.";

  if (lower.includes('stop') || lower.includes('unsubscribe')) {
    reply = "You've been unsubscribed. Text START to resume. Have a great day!";
  } else if (isInterested) {
    reply = "Awesome! Brandon will call you shortly to set everything up. Excited to help!";
  }

  // Reply to customer
  await client.messages.create({
    body: reply,
    from: fromNumber,
    to: customerPhone,
  });

  // Alert YOU if interested
  if (isInterested) {
    await client.messages.create({
      body: `INTEREST ALERT from ${customerPhone}!\nMessage: "${message}"\nReply or call now!`,
      from: fromNumber,
      to: process.env.MY_PERSONAL_NUMBER!,
    });
  }

  // Respond to Twilio
  res
    .status(200)
    .setHeader('Content-Type', 'text/xml')
    .send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${reply}</Message></Response>`);
}
