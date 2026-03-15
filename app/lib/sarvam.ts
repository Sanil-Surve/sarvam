// lib/sarvam.ts
"use server";

import { SarvamAIClient } from "sarvamai";


const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY!
});

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

export async function speechToText(formData: FormData) {
  const audioFile = formData.get('file') as File;
  if (!audioFile) throw new Error("No audio file found in formData");

  const response = await client.speechToText.transcribe({
    file: audioFile,
    model: "saaras:v3",
    mode: "transcribe"  // default mode
  });

  return response;
}

export async function textToSpeech(text: string) {
  const response = await client.textToSpeech.convert({
    text: text,
    target_language_code: 'mr-IN',
    speaker: 'shubh',
    model: 'bulbul:v3'
  });
  
  if (!response.audios || !response.audios[0]) {
    console.error("Unexpected TTS response format:", response);
    throw new Error("No audio returned from Sarvam API");
  }

  return response.audios[0]; // Base64 encoded audio
}