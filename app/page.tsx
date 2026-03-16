'use client';

import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { speechToText, textToSpeech } from './lib/sarvam';
import { SUPPORTED_LANGUAGES, SUPPORTED_SPEAKERS } from './lib/utils';

// --- Subcomponents for optimized modularity ---

function SettingsPanel({
  language,
  setLanguage,
  speaker,
  setSpeaker,
  disabled
}: {
  language: string;
  setLanguage: (v: string) => void;
  speaker: string;
  setSpeaker: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="mb-10 w-full flex flex-col sm:flex-row gap-6 max-w-lg mx-auto relative z-20">
      <div className="relative w-full group">
        <label className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-widest">Language</label>
        <div className="relative">
          <select
            disabled={disabled}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-700/60 text-zinc-200 font-medium text-sm rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 block px-4 py-3.5 pr-10 appearance-none outline-none disabled:opacity-50 hover:border-zinc-500/60 shadow-inner shadow-black/20"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-zinc-900 text-zinc-100">
                {lang.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative w-full group">
        <label className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-widest">Voice Avatar</label>
        <div className="relative">
          <select
            disabled={disabled}
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-700/60 text-zinc-200 font-medium text-sm rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 block px-4 py-3.5 pr-10 appearance-none outline-none disabled:opacity-50 hover:border-zinc-500/60 shadow-inner shadow-black/20"
          >
            <optgroup label="Male Voices" className="bg-zinc-900 text-zinc-500 font-semibold">
              {SUPPORTED_SPEAKERS.filter(s => s.gender === 'Male').map(s => (
                <option key={s.id} value={s.id} className="text-zinc-100 font-medium">{s.name}</option>
              ))}
            </optgroup>
            <optgroup label="Female Voices" className="bg-zinc-900 text-zinc-500 font-semibold">
              {SUPPORTED_SPEAKERS.filter(s => s.gender === 'Female').map(s => (
                <option key={s.id} value={s.id} className="text-zinc-100 font-medium">{s.name}</option>
              ))}
            </optgroup>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDisplay({ status, isRecording }: { status: string; isRecording: boolean }) {
  const isIdle = status === 'Ready' || status === 'Idle';
  const isError = status.toLowerCase().includes('error') || status.toLowerCase().includes('denied');

  return (
    <div className={`mt-10 mx-auto w-fit flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500 border ${
      isIdle 
        ? 'bg-zinc-800/30 border-zinc-700/50 text-zinc-400' 
        : isError 
          ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
          : isRecording 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
    }`}>
      <div className="relative flex items-center justify-center w-3 h-3">
        {!isIdle && !isError && (
          <div className={`absolute w-full h-full rounded-full opacity-60 animate-ping ${
            isRecording ? 'bg-rose-400' : 'bg-cyan-400'
          }`} />
        )}
        <div className={`w-2 h-2 rounded-full relative z-10 ${
          isIdle ? 'bg-zinc-500' : isError ? 'bg-red-500' : isRecording ? 'bg-rose-500' : 'bg-cyan-400'
        }`} />
      </div>
      <p className="text-sm font-semibold tracking-wide">
        {status}
      </p>
    </div>
  );
}

// Pure CSS audio visualizer animation for recording state
function Visualizer({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none opacity-50 mix-blend-screen overflow-hidden rounded-full px-4">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="w-1.5 bg-rose-400 rounded-full animate-pulse transition-all duration-75" 
          style={{ 
            height: `${30 + Math.random() * 50}%`, 
            animationDuration: `${0.3 + Math.random() * 0.4}s`,
            animationDelay: `${Math.random() * 0.2}s`
          }} 
        />
      ))}
    </div>
  );
}

export default function HealthAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [language, setLanguage] = useState('en-IN');
  const [speaker, setSpeaker] = useState('shubh');
  
  // Use refs for imperative media recording state (Vercel best practice)
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const processVoice = useCallback(async (blob: Blob) => {
    try {
      setStatus('Transcribing...');
      // 1. STT call
      const formData = new FormData();
      formData.append('file', blob, 'audio.wav');
      const sttResponse = await speechToText(formData);

      const transcript = sttResponse.transcript;
      if (!transcript) {
        setStatus('Ready');
        return;
      }

      setStatus('Analyzing...');
      // 2. Analyze call (Groq)
      const analyzeResponse = await axios.post('/api/analyze', { text: transcript, history: [], language });
      const aiResponseText = analyzeResponse.data.response;

      setStatus('Generating Audio...');
      // 3. TTS call (Sarvam.ai)
      const base64Audio = await textToSpeech(aiResponseText, language, speaker);

      setStatus('Playing Audio...');
      // 4. Play Audio
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.onended = () => setStatus('Ready');
      await audio.play();
    } catch (error) {
      console.error(error);
      setStatus('Error occurred');
      setTimeout(() => setStatus('Ready'), 3000);
    }
  }, [language, speaker]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        processVoice(audioBlob);
        // Clean up mic tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setStatus('Listening...');
    } catch (err) {
      console.error("Mic access denied", err);
      setStatus('Mic Access Denied');
    }
  }, [processVoice]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      startRecording();
    }
  }, [isRecording, startRecording]);

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Cinematic Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none opacity-30 select-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[8000ms]" />
        <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[130px] rounded-full mix-blend-screen animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-600/20 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-[12000ms]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800/80 text-xs font-bold text-zinc-300 mb-8 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="tracking-wide">POWERED BY SARVAM AI</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-5 leading-tight">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500">Health</span> Agent
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-md mx-auto leading-relaxed font-medium">
            Your personal healthcare companion. Tap to ask any medical question.
          </p>
        </div>

        {/* Core Interface Card */}
        <div className="w-full relative bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/60 rounded-[3rem] p-8 sm:p-14 shadow-2xl shadow-black/80">
          
          <SettingsPanel 
            language={language} setLanguage={setLanguage}
            speaker={speaker} setSpeaker={setSpeaker}
            disabled={isRecording || (status !== 'Ready' && status !== 'Idle' && !status.toLowerCase().includes('error'))}
          />

          {/* Interactive Mic Button */}
          <div className="relative flex justify-center py-6 sm:py-10">
            {/* Ambient Active Glow */}
            {isRecording && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-rose-500/20 blur-3xl rounded-full" />
            )}
            
            <button
              onClick={toggleRecording}
              className={`
                relative z-20 flex items-center justify-center w-40 h-40 rounded-full outline-none
                transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isRecording 
                  ? 'bg-zinc-950 border-2 border-rose-500/50 scale-[1.03] shadow-[0_0_50px_rgba(244,63,94,0.3)]' 
                  : 'bg-zinc-800/90 border border-zinc-700/60 hover:bg-zinc-800 hover:scale-105 hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.2)] shadow-xl'
                }
              `}
            >
              <div className={`
                absolute inset-3 rounded-full flex items-center justify-center transition-colors duration-500 overflow-hidden
                ${isRecording ? 'bg-zinc-900/60' : 'bg-gradient-to-b from-zinc-700/60 to-zinc-800/80'}
              `}>
                {isRecording ? (
                  <>
                    <Visualizer active={isRecording} />
                    <div className="relative z-10 w-10 h-10 rounded-sm bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.7)]" />
                  </>
                ) : (
                  <svg className="w-14 h-14 text-zinc-300 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </div>
            </button>
          </div>

          <StatusDisplay status={status} isRecording={isRecording} />

        </div>
      </div>
    </main>
  );
}