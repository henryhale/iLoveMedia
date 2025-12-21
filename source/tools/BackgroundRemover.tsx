import React, { useState, useCallback, useRef } from 'react';
import { ScissorIcon, DownloadIcon, RefreshIcon, CheckIcon, ImageIcon } from '../components/Icon';
import { removeBackground } from '@imgly/background-removal';

const BackgroundRemover: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFile(file);
      setOriginalUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
      setProgress(0);
    }
  };

  const handleRemoveBackground = async () => {
    if (!originalUrl) {
      setIsProcessing(false);
      setError("Failed to generate image path");
      setProgress(0);
      return
    }
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Library processes everything locally in browser using WASM
      const resultBlob = await removeBackground(originalUrl, {
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          setProgress(percent);
          console.log(`[${key}] ${percent}%`);
        }
      });
      
      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
    } catch (err) {
      console.error('Background removal failed:', err);
      setError('Failed to process image. This tool requires a modern browser and may take a moment to initialize the AI model (~40MB).');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `background-removed-${Date.now()}.png`;
    a.click();
  };

  const reset = () => {
    setOriginalFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
            <ScissorIcon className="w-6 h-6"/>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Background Remover</h2>
            <p className="text-sm text-gray-500">Remove image backgrounds instantly in your browser</p>
          </div>
        </div>

        {!originalUrl ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl p-16 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8"/>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">Drop your image here</p>
                  <p className="text-gray-500 dark:text-gray-400">or click to browse local files</p>
                </div>
                <div className="pt-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500">Supports PNG, JPG, WEBP</span>
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
                 {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side: Original */}
              <div className="space-y-3">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Original Image</label>
                 <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center relative">
                    <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                         <RefreshIcon className="w-10 h-10 animate-spin mb-4" />
                         <p className="font-bold">Analyzing pixels...</p>
                         <p className="text-xs opacity-75">{progress}% Complete</p>
                         <div className="w-48 h-1.5 bg-white/20 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Right Side: Result */}
              <div className="space-y-3">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Result (Transparent)</label>
                 <div className="aspect-square pattern-checkered bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                    {resultUrl ? (
                      <img src={resultUrl} alt="Result" className="max-w-full max-h-full object-contain animate-in zoom-in duration-500" />
                    ) : (
                      <div className="text-center p-8">
                        <ScissorIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4 opacity-20" />
                        <p className="text-sm text-gray-400 font-medium">Ready to process</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t dark:border-gray-700">
               {!resultUrl ? (
                 <button 
                   onClick={handleRemoveBackground}
                   disabled={isProcessing}
                   className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {isProcessing ? <RefreshIcon className="w-5 h-5 animate-spin"/> : <ScissorIcon className="w-5 h-5"/>}
                   {isProcessing ? `Removing Background (${progress}%)` : 'Remove Background'}
                 </button>
               ) : (
                 <button 
                   onClick={handleDownload}
                   className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                   <DownloadIcon className="w-5 h-5"/>
                   Download Transparent PNG
                 </button>
               )}
               <button 
                 onClick={reset}
                 disabled={isProcessing}
                 className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
               >
                 {resultUrl ? 'New Image' : 'Reset'}
               </button>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider">100% Client-Side</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">Processing happens in your browser's RAM. No image data is ever uploaded to a server.</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider">Edge AI Model</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">Uses a dedicated WASM-powered background removal model for precision masking.</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider">High Resolution</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">Exports your processed image as a full-resolution 32-bit PNG with alpha transparency.</p>
           </div>
        </div>
      </div>
      <style>{`
        .pattern-checkered {
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px);
          background-position: 0 0, 10px 10px;
          background-size: 20px 20px;
        }
        .dark .pattern-checkered {
          background-image: radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
};

export default BackgroundRemover;