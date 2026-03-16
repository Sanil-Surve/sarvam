'use client';
import { useState, useRef } from 'react';
import axios from 'axios';
import { speechToText, textToSpeech } from './lib/sarvam';
import { SUPPORTED_LANGUAGES, SUPPORTED_SPEAKERS } from './lib/utils';

export default function HealthAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [language, setLanguage] = useState('en-IN');
  const [speaker, setSpeaker] = useState('shubh');
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      processVoice(audioBlob);
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const processVoice = async (blob: Blob) => {
    try {
      setStatus('Transcribing...');
      // 1. STT call
      const formData = new FormData();
      formData.append('file', blob, 'audio.wav');
      const sttResponse = await speechToText(formData);

      const transcript = sttResponse.transcript;
      if (!transcript) throw new Error('Failed to transcribe');

      setStatus('Analyzing...');
      // 2. Analyze call (Groq)
      const analyzeResponse = await axios.post('/api/analyze', { text: transcript, history: [], language });
      const aiResponseText = analyzeResponse.data.response;

      setStatus('Generating Audio...');
      // 3. TTS call (Sarvam)
      const base64Audio = await textToSpeech(aiResponseText, language, speaker);

      setStatus('Playing Audio...');
      // 4. Play Audio
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.onended = () => setStatus('Ready');
      await audio.play();
    } catch (error) {
      console.error(error);
      setStatus('Error occurred');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />
      <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />

      {/* Glass Container */}
      <div className="relative z-10 w-full max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl flex flex-col items-center text-center transition-all duration-500 hover:bg-white/15">

        <div className="mb-6 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium border border-white/10 backdrop-blur-md">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Powered By Sarvam AI</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Health</span> Agent
        </h1>

        <p className="text-white/70 mb-8 text-lg leading-relaxed max-w-sm">
          Tap and ask me any health-related question.
        </p>

        {/* Settings Selection */}
        <div className="mb-10 w-full flex flex-col sm:flex-row gap-4 max-w-sm relative z-20">
          <div className="relative w-full">
            <label htmlFor="language-select" className="sr-only">
              Target Language
            </label>
            <div className="relative">
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white font-medium text-sm rounded-xl focus:ring-purple-400 focus:border-purple-400 block px-4 py-3 pr-10 appearance-none backdrop-blur-md transition-all duration-300 hover:bg-white/15 outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-indigo-900 text-white font-medium">
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/70">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="relative w-full">
            <label htmlFor="speaker-select" className="sr-only">
              Speaker
            </label>
            <div className="relative">
              <select
                id="speaker-select"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white font-medium text-sm rounded-xl focus:ring-purple-400 focus:border-purple-400 block px-4 py-3 pr-10 appearance-none backdrop-blur-md transition-all duration-300 hover:bg-white/15 outline-none"
              >
                <optgroup label="Male" className="bg-indigo-900 text-white">
                  {SUPPORTED_SPEAKERS.filter(s => s.gender === 'Male').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Female" className="bg-indigo-900 text-white">
                  {SUPPORTED_SPEAKERS.filter(s => s.gender === 'Female').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/70">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Record Button Container */}
        <div className="relative mb-12 flex items-center justify-center">
          {/* Ring Pulses when recording */}
          {isRecording && (
            <>
              <div className="absolute w-32 h-32 bg-red-500/30 rounded-full animate-ping" />
              <div className="absolute w-40 h-40 border border-red-500/20 rounded-full animate-pulse" />
            </>
          )}

          <button
            onClick={isRecording ? () => mediaRecorder.current?.stop() : startRecording}
            className={`
              relative z-10 w-28 h-28 rounded-full flex items-center justify-center flex-col gap-2 
              transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              hover:scale-105 active:scale-95 shadow-lg
              ${isRecording
                ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/40 border border-red-400/50'
                : 'bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-md border border-white/30 shadow-blue-500/30'}
            `}
          >
            {isRecording ? (
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
            <span className="text-xs font-semibold tracking-wider uppercase opacity-90">
              {isRecording ? 'Stop' : 'Talk'}
            </span>
          </button>
        </div>

        {/* Status Indicator */}
        <div className={`
          flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500
          ${status === 'Ready' || status === 'Idle' ? 'bg-white/5 opacity-60' : 'bg-white/10 border border-white/20 shadow-xl backdrop-blur-lg animate-pulse'}
        `}>
          <div className={`w-2.5 h-2.5 rounded-full ${isRecording || status !== 'Ready' && status !== 'Idle' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          <p className="text-sm font-medium tracking-wide text-white/90">
            {status}
          </p>
        </div>

      </div>
    </main>
  );
}