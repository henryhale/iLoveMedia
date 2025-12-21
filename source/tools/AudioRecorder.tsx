
import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, StopIcon, DownloadIcon, RefreshIcon, PlayIcon } from '../components/Icon';

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioURL(null);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors text-center">
        <h2 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2 text-gray-900 dark:text-white">
          <MicIcon className="w-5 h-5 text-red-500"/>
          Audio Recorder
        </h2>

        <div className="flex flex-col items-center space-y-8">
          {/* Visualizer / Timer Circle */}
          <div className={`relative w-48 h-48 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isRecording ? 'border-red-500 scale-110 shadow-lg shadow-red-500/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
              {formatTime(recordingTime)}
            </div>
            {isRecording && (
               <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-25"></div>
            )}
          </div>

          <div className="flex gap-4">
            {!isRecording ? (
              <button 
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-md"
              >
                <MicIcon className="w-5 h-5"/>
                Start Recording
              </button>
            ) : (
              <button 
                onClick={stopRecording}
                className="bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-md"
              >
                <StopIcon className="w-5 h-5"/>
                Stop Recording
              </button>
            )}
          </div>

          {audioURL && !isRecording && (
            <div className="w-full pt-8 animate-in fade-in slide-in-from-top-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recording Finished</p>
                 <audio controls src={audioURL} className="w-full" />
                 <div className="flex gap-2">
                    <a 
                      href={audioURL} 
                      download="recording.webm"
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <DownloadIcon className="w-4 h-4"/>
                      Download
                    </a>
                    <button 
                      onClick={() => { setAudioURL(null); setRecordingTime(0); }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <RefreshIcon className="w-4 h-4 text-gray-500"/>
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
          Recording is processed locally in your browser and never uploaded to any server.
        </p>
      </div>
    </div>
  );
};

export default AudioRecorder;
