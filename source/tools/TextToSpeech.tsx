import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2Icon, PlayIcon, DownloadIcon, RefreshIcon, StopIcon } from '../components/Icon';

// Dynamic import for Kokoro as it's an alternative engine
let KokoroModule: any = null;

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('Welcome to BrowserBox. Your privacy-first workspace.');
  const [engine, setEngine] = useState<'native' | 'kokoro'>('native');
  const [nativeVoices, setNativeVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  
  // Settings
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  
  const kokoroRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Native Voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setNativeVoices(voices);
      if (voices.length > 0 && !selectedVoiceURI) {
        // Prefer English voices as default if available
        const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        setSelectedVoiceURI(defaultVoice.voiceURI);
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => { 
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null; 
    };
  }, [selectedVoiceURI]);

  const loadKokoro = async () => {
    if (kokoroRef.current) return kokoroRef.current;
    setIsModelLoading(true);
    setLoadProgress(10);
    try {
      if (!KokoroModule) {
        // Using esm.sh with bundle option for more stability
        KokoroModule = await import('kokoro-js');
      }
      setLoadProgress(40);
      
      // Extensive check for the Kokoro class within the module
      // esm.sh can wrap things in .default or provide them as named exports
      let KokoroClass = null;
      if (KokoroModule.Kokoro) {
        KokoroClass = KokoroModule.Kokoro;
      } else if (KokoroModule.default?.Kokoro) {
        KokoroClass = KokoroModule.default.Kokoro;
      } else if (typeof KokoroModule.default === 'function' && KokoroModule.default.fromPretrained) {
        KokoroClass = KokoroModule.default;
      } else if (typeof KokoroModule.fromPretrained === 'function') {
        KokoroClass = KokoroModule;
      }

      if (!KokoroClass || typeof KokoroClass.fromPretrained !== 'function') {
        console.error("Module structure:", KokoroModule);
        throw new Error("Kokoro engine initialization failed: class not found.");
      }

      const k = await KokoroClass.fromPretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
        dtype: "q8", // q8 is usually best for browser balancing quality and speed
        device: "wasm"
      });
      
      setLoadProgress(100);
      kokoroRef.current = k;
      return k;
    } catch (err) {
      console.error("Failed to load Kokoro:", err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`AI Engine Load Error: ${msg}. Switching back to system voices.`);
      setEngine('native');
      return null;
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!text.trim()) return;

    if (engine === 'native') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = nativeVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = volume;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
      try {
        const k = await loadKokoro();
        if (!k) {
          setIsSpeaking(false);
          return;
        }
        
        // Kokoro generate returns an object that typically has a play method
        const audio = await k.generate(text, {
          voice: "af_bella", 
          speed: rate
        });
        
        if (audio && typeof audio.play === 'function') {
          currentAudioRef.current = audio;
          audio.play();
          audio.onended = () => {
            setIsSpeaking(false);
            currentAudioRef.current = null;
          };
        } else {
          setIsSpeaking(false);
          console.error("Generated audio invalid:", audio);
          alert("Audio generation error. Check the console for details.");
        }
      } catch (err) {
        console.error("Kokoro generation error:", err);
        setIsSpeaking(false);
      }
    }
  };

  const handleStop = () => {
    if (engine === 'native') {
      window.speechSynthesis.cancel();
    } else if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
              <Volume2Icon className="w-6 h-6"/>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Text-to-Speech</h2>
              <p className="text-sm text-gray-500">Local processing via WebSpeech or Kokoro AI</p>
            </div>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
            <button 
              onClick={() => setEngine('native')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${engine === 'native' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'}`}
            >
              System Native
            </button>
            <button 
              onClick={() => {
                setEngine('kokoro');
                loadKokoro();
              }}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${engine === 'kokoro' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'}`}
            >
              Kokoro AI
              <span className="text-[10px] bg-green-100 dark:bg-green-900 text-green-600 px-1.5 py-0.5 rounded uppercase font-bold">HQ</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Input Text</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type something to hear it..."
                className="w-full h-64 p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none text-lg leading-relaxed shadow-inner"
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                {text.length} characters
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={isSpeaking ? handleStop : handleSpeak}
                disabled={isModelLoading}
                className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] ${isSpeaking ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'} disabled:opacity-50`}
              >
                {isModelLoading ? <RefreshIcon className="w-5 h-5 animate-spin"/> : isSpeaking ? <StopIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                {isModelLoading ? 'Loading AI Model...' : isSpeaking ? 'Stop Playing' : 'Start Reading'}
              </button>
            </div>

            {isModelLoading && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <div className="flex justify-between text-xs font-bold text-green-600 dark:text-green-400 uppercase">
                  <span>Downloading Kokoro Engine</span>
                  <span>{loadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-900 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${loadProgress}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 text-center italic">Initial download is ~80MB. This will be cached for next time.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <RefreshIcon className="w-3 h-3"/> Parameters
              </h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Rate (Speed)</label>
                    <span className="text-xs font-mono text-green-600">{rate}x</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="2" step="0.1" value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Pitch</label>
                    <span className="text-xs font-mono text-green-600">{pitch}</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="2" step="0.1" value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    disabled={engine === 'kokoro'}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 disabled:opacity-30"
                  />
                  {engine === 'kokoro' && <p className="text-[10px] text-gray-400 mt-1">Pitch is voice-specific in Kokoro.</p>}
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Volume</label>
                    <span className="text-xs font-mono text-green-600">{Math.round(volume * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1" value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                {engine === 'native' ? 'System Voices' : 'AI Voice Profiles'}
              </label>
              
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {engine === 'native' ? (
                  nativeVoices.length > 0 ? (
                    nativeVoices.map((v) => (
                      <button
                        key={v.voiceURI}
                        onClick={() => setSelectedVoiceURI(v.voiceURI)}
                        className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center justify-between ${selectedVoiceURI === v.voiceURI ? 'border-green-500 bg-white dark:bg-gray-800 shadow-sm' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]">{v.name}</span>
                          <span className="text-[10px] text-gray-500 uppercase">{v.lang}</span>
                        </div>
                        {v.localService && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded font-bold">Offline</span>}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic p-4 text-center">No system voices detected.</p>
                  )
                ) : (
                  ['af_bella', 'af_nicole', 'af_sky', 'bf_emma', 'bf_isabella'].map(v => (
                    <button
                      key={v}
                      disabled={isModelLoading}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center ${isModelLoading ? 'opacity-50 cursor-not-allowed' : 'border-green-500 bg-white dark:bg-gray-800 shadow-sm'}`}
                    >
                      <span className="font-bold text-gray-900 dark:text-white uppercase">{v.replace('af_', '').replace('bf_', '')}</span>
                      <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded font-bold">AI Optimized</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default TextToSpeech;
