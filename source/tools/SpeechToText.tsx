import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WavesIcon, MicIcon, StopIcon, CopyIcon, CheckIcon, RefreshIcon, PlayIcon, DownloadIcon } from '../components/Icon';

// Dynamically imported for high-accuracy local transcription
let pipeline: any = null;
let env: any = null;

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' }
];

const SpeechToText: React.FC = () => {
  const [engine, setEngine] = useState<'native' | 'whisper'>('native');
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [interimResult, setInterimResult] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [copied, setCopied] = useState(false);
  
  // Whisper Specific State
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriberRef = useRef<any>(null);

  // Initialize Native Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && engine === 'native') {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      // Map simplified codes for native API if needed (e.g., 'en' -> 'en-US')
      recognition.lang = selectedLang === 'en' ? 'en-US' : selectedLang;

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        setTranscription(prev => prev + final);
        setInterimResult(interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) recognition.start(); // Keep listening if we didn't manually stop
      };

      recognitionRef.current = recognition;
    }
    
    return () => {
        if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [selectedLang, engine, isListening]);

  // Load Whisper Model via Transformers.js
  const loadWhisper = async () => {
    if (transcriberRef.current) return transcriberRef.current;
    
    setIsModelLoading(true);
    setLoadProgress(0);
    
    try {
      const { pipeline: getPipeline, env: transformersEnv } = await import('@xenova/transformers');
      env = transformersEnv;
      
      // Configure environment for browser
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      const transcriber = await getPipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
        progress_callback: (data: any) => {
          if (data.status === 'progress') {
            setLoadProgress(Math.round(data.progress));
          }
        }
      });
      
      transcriberRef.current = transcriber;
      setLoadProgress(100);
      return transcriber;
    } catch (err) {
      console.error("Whisper Load Error:", err);
      alert("Failed to load Whisper AI. Ensure you have a stable connection for the initial 40MB download.");
      setEngine('native');
      return null;
    } finally {
      setIsModelLoading(false);
    }
  };

  const startNativeListening = () => {
    setInterimResult('');
    recognitionRef.current?.start();
    setIsListening(true);
  };

  const stopNativeListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const startWhisperRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      setAudioBlob(null);
    } catch (err) {
      console.error("Mic Access Error:", err);
      alert("Microphone access denied.");
    }
  };

  const stopWhisperRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const runWhisperTranscription = async () => {
    if (!audioBlob) return;
    
    setIsTranscribing(true);
    setInterimResult('Analyzing audio...');
    
    try {
      const transcriber = await loadWhisper();
      if (!transcriber) return;

      // Convert Blob to Float32Array (16kHz mono required by Whisper)
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = audioBuffer.getChannelData(0);

      const output = await transcriber(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        language: selectedLang,
        task: 'transcribe',
      });

      setTranscription(prev => (prev ? prev + ' ' : '') + output.text.trim());
      setInterimResult('');
      setAudioBlob(null);
    } catch (err) {
      console.error("Transcription Error:", err);
      setInterimResult('Error transcribing audio.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleToggleListening = () => {
    if (engine === 'native') {
      isListening ? stopNativeListening() : startNativeListening();
    } else {
      isListening ? stopWhisperRecording() : startWhisperRecording();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setTranscription('');
    setInterimResult('');
    setAudioBlob(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
              <WavesIcon className="w-6 h-6"/>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Speech-to-Text</h2>
              <p className="text-sm text-gray-500">Live streaming or high-accuracy Whisper AI</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
              <button 
                onClick={() => { setEngine('native'); clear(); }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${engine === 'native' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'}`}
              >
                Native Live
              </button>
              <button 
                onClick={() => { setEngine('whisper'); clear(); loadWhisper(); }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${engine === 'whisper' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'}`}
              >
                Whisper AI
                <span className="text-[9px] bg-green-100 dark:bg-green-900 text-green-600 px-1.5 py-0.5 rounded uppercase font-bold">WASM</span>
              </button>
            </div>
            
            <select 
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Interaction Column */}
          <div className="lg:col-span-4 flex flex-col items-center gap-8 border-r dark:border-gray-700 pr-0 lg:pr-8">
            <div className="relative flex flex-col items-center">
              <button 
                onClick={handleToggleListening}
                disabled={isTranscribing || isModelLoading}
                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl disabled:opacity-50 ${isListening ? 'bg-red-500 scale-110 shadow-red-500/40 ring-4 ring-red-100 dark:ring-red-900/30' : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'}`}
              >
                {isListening ? <StopIcon className="w-12 h-12 text-white animate-pulse"/> : <MicIcon className="w-12 h-12 text-white"/>}
              </button>
              
              {isListening && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center gap-1 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 h-8 bg-green-400/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}

              <div className="mt-6 text-center">
                <p className={`text-lg font-bold ${isListening ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                  {isListening ? (engine === 'native' ? 'Listening...' : 'Recording...') : 'Start Mic'}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
                    {engine === 'native' ? 'Streaming Transcription' : 'Segment Transcription'}
                </p>
              </div>
            </div>

            {/* Action for Whisper Recording */}
            {engine === 'whisper' && audioBlob && !isListening && (
              <div className="w-full animate-in zoom-in duration-300">
                <button 
                  onClick={runWhisperTranscription}
                  disabled={isTranscribing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                >
                  {isTranscribing ? <RefreshIcon className="w-5 h-5 animate-spin"/> : <WavesIcon className="w-5 h-5"/>}
                  {isTranscribing ? 'Transcribing...' : 'Transcribe Recording'}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2">Audio ready to process locally</p>
              </div>
            )}

            {isModelLoading && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-green-600 uppercase">
                  <span>Loading Tiny-Whisper</span>
                  <span>{loadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 transition-all duration-300" style={{ width: `${loadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Transcription Display Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Result Console</label>
              <div className="flex gap-4">
                {transcription && (
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:underline">
                    {copied ? <CheckIcon className="w-3 h-3"/> : <CopyIcon className="w-3 h-3"/>}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
                <button onClick={clear} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500">
                  <RefreshIcon className="w-3 h-3"/> Reset
                </button>
              </div>
            </div>

            <div className={`w-full min-h-[350px] p-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl transition-all shadow-inner relative overflow-hidden ${isListening || isTranscribing ? 'ring-2 ring-green-500/20' : ''}`}>
               {transcription || interimResult ? (
                 <div className="text-xl leading-relaxed text-gray-800 dark:text-gray-200">
                    <p>{transcription}</p>
                    {interimResult && (
                      <p className="text-green-500 dark:text-green-400 font-medium transition-all animate-pulse mt-2">
                        {interimResult}
                      </p>
                    )}
                 </div>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-4">
                    <WavesIcon className="w-12 h-12" />
                    <p className="font-medium italic text-center px-8">
                        {engine === 'native' ? 'Speak to see live text output...' : 'Record a clip, then use Whisper for high accuracy...'}
                    </p>
                 </div>
               )}
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <CheckIcon className="w-4 h-4 text-emerald-500"/>
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-wide">
                <span className="font-bold text-gray-700 dark:text-gray-300">Engine Details:</span><br/>
                <b>{engine === 'native' ? 'Web Speech API' : 'Whisper-Tiny (WASM)'}</b>. 
                {engine === 'native' 
                    ? ' Fastest response, requires browser support, cloud-dependent for some OS.' 
                    : ' Highest accuracy, 100% offline private processing, requires ~40MB model download.'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;