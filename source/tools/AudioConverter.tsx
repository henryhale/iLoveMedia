
import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { MusicIcon, DownloadIcon, RefreshIcon, CheckIcon } from '../components/Icon';

const AudioConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('mp3');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedURL, setConvertedURL] = useState<string | null>(null);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    // Consistent CDN base for core files
    const coreBaseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    // Consistent CDN base for the library's own worker
    const ffmpegBaseURL = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm';
    
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg Log:', message);
    });

    ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
    });

    try {
      // Explicitly load all components via toBlobURL to bypass CORS/Worker origin restrictions
      await ffmpeg.load({
        coreURL: await toBlobURL(`${coreBaseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${coreBaseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        // This workerURL is the key to fixing the "Failed to construct Worker" error
        // It points to the library's internal worker script, converted to a Blob URL
        workerURL: await toBlobURL(`${ffmpegBaseURL}/worker.js`, 'text/javascript'),
      });
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to load FFmpeg:', err);
      alert('Failed to load FFmpeg components. This may be due to browser security settings or network restrictions.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setConvertedURL(null);
      setProgress(0);
    }
  };

  const convert = async () => {
    if (!file || !isLoaded) return;
    setIsConverting(true);
    setConvertedURL(null);
    setProgress(0);

    const ffmpeg = ffmpegRef.current;
    const inputName = file.name;
    const outputName = `output.${targetFormat}`;

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      // Execute the conversion command
      await ffmpeg.exec(['-i', inputName, outputName]);
      
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([data], { type: `audio/${targetFormat}` }));
      setConvertedURL(url);
    } catch (err) {
      console.error('Conversion failed:', err);
      alert('Conversion failed. This might be due to format incompatibility or browser resource limits.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <MusicIcon className="w-5 h-5 text-green-600 dark:text-green-400"/>
          Audio Converter (FFmpeg WASM)
        </h2>

        {!isLoaded && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm text-green-700 dark:text-green-300 mb-6 flex items-center gap-3 border border-green-100 dark:border-green-900/30">
             <RefreshIcon className="w-4 h-4 animate-spin"/>
             Initializing FFmpeg secure environment...
          </div>
        )}

        {!file ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                    <MusicIcon className="w-6 h-6"/>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Upload an audio file</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">MP3, WAV, AAC, OGG, etc.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded flex items-center justify-center text-green-600">
                    <MusicIcon className="w-6 h-6"/>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => {
                    setFile(null);
                    setConvertedURL(null);
                    setProgress(0);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <RefreshIcon className="w-5 h-5"/>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Format</label>
                   <select 
                     value={targetFormat} 
                     onChange={(e) => setTargetFormat(e.target.value)}
                     className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                   >
                     <option value="mp3">MP3</option>
                     <option value="wav">WAV</option>
                     <option value="aac">AAC</option>
                     <option value="ogg">OGG</option>
                   </select>
                </div>

                <div className="flex flex-col justify-end">
                   <button 
                     onClick={convert}
                     disabled={isConverting || !isLoaded}
                     className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                   >
                     {isConverting ? <RefreshIcon className="w-4 h-4 animate-spin"/> : <CheckIcon className="w-4 h-4"/>}
                     {isConverting ? `Converting (${progress}%)` : 'Start Conversion'}
                   </button>
                </div>
            </div>

            {isConverting && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Processing...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-600 h-full transition-all duration-300 ease-out" 
                          style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {convertedURL && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in zoom-in duration-300">
                    <p className="text-emerald-700 dark:text-emerald-300 font-bold mb-3 flex items-center gap-2">
                        <CheckIcon className="w-5 h-5"/> Conversion Successful!
                    </p>
                    <audio controls src={convertedURL} className="w-full mb-4 rounded-lg" />
                    <a 
                      href={convertedURL} 
                      download={`converted.${targetFormat}`}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all"
                    >
                        <DownloadIcon className="w-5 h-5"/>
                        Download Result
                    </a>
                </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Conversion is powered by FFmpeg WebAssembly. 
                Everything stays on your device. Large files may take more time depending on your hardware.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AudioConverter;
