import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { text, history } = await req.json();

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful AI Health Assistant. Use the provided context to answer health queries accurately. Keep responses concise for voice output. output should be in simple language and below 1000 characters long.`" },
      ...history,
      { role: "user", content: text },
    ],
    model: "openai/gpt-oss-120b",
    temperature: 0.5,
  });

  let aiResponse = completion.choices[0].message.content || "Sorry, I am unable to process that right now.";
  // Sarvam Text To Speech max characters is 2500
  if (aiResponse.length > 2000) {
    aiResponse = aiResponse.substring(0, 1996) + "...";
  }

  return NextResponse.json({ response: aiResponse });
}