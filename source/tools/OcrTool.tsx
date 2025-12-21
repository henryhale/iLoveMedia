import React, { useState, useCallback, useRef } from 'react';
import { ScanIcon, DownloadIcon, RefreshIcon, CheckIcon, ImageIcon, CopyIcon } from '../components/Icon';
import Tesseract from 'tesseract.js';

const OCR_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'chi_sim', name: 'Chinese (Simp)' },
  { code: 'jpn', name: 'Japanese' }
];

const OcrTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [lang, setLang] = useState('eng');
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setExtractedText('');
      setProgress(0);
      setStatus('');
    }
  };

  const handleOcr = async () => {
    if (!imageUrl) return;
    
    setIsProcessing(true);
    setProgress(0);
    setStatus('Initializing Tesseract...');

    try {
      const { data: { text } } = await Tesseract.recognize(
        imageUrl,
        lang,
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
            setStatus(m.status);
          }
        }
      );
      
      setExtractedText(text);
      setStatus('Complete');
    } catch (err) {
      console.error('OCR failed:', err);
      setStatus('Error: Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setImageFile(null);
    setImageUrl(null);
    setExtractedText('');
    setIsProcessing(false);
    setProgress(0);
    setStatus('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
              <ScanIcon className="w-6 h-6"/>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Image to Text (OCR)</h2>
              <p className="text-sm text-gray-500">Extract editable text from images entirely in your browser</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-400 uppercase">Language</label>
            <select 
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            >
              {OCR_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {!imageUrl ? (
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
                  <p className="text-xl font-bold text-gray-900 dark:text-white">Drop image with text here</p>
                  <p className="text-gray-500 dark:text-gray-400">or click to browse documents, photos, or screenshots</p>
                </div>
                <div className="pt-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500">Fast Local OCR</span>
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Image Preview */}
              <div className="space-y-3">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Source Image</label>
                 <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center relative shadow-inner">
                    <img src={imageUrl} alt="Source" className="max-w-full max-h-full object-contain" />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                         <RefreshIcon className="w-10 h-10 animate-spin mb-4" />
                         <p className="font-bold text-lg">{status}</p>
                         {progress > 0 && <p className="text-sm opacity-75">{progress}% Complete</p>}
                         <div className="w-full max-w-xs h-1.5 bg-white/20 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-green-400 transition-all duration-300" style={{ width: `${progress}%` }} />
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Right Side: Extracted Text */}
              <div className="space-y-3 flex flex-col">
                 <div className="flex justify-between items-center">
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Extracted Text</label>
                   {extractedText && (
                     <div className="flex gap-4">
                       <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:underline">
                         {copied ? <CheckIcon className="w-3 h-3"/> : <CopyIcon className="w-3 h-3"/>}
                         {copied ? 'Copied' : 'Copy'}
                       </button>
                     </div>
                   )}
                 </div>
                 <div className="flex-grow min-h-[300px] lg:min-h-0 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl relative overflow-hidden group shadow-inner">
                    <textarea 
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      placeholder={isProcessing ? "Analyzing image..." : "Extracted text will appear here..."}
                      className="w-full h-full p-6 bg-transparent text-gray-800 dark:text-gray-200 font-mono text-sm resize-none focus:outline-none placeholder-gray-400 scrollbar-thin"
                    />
                    {!extractedText && !isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
                        <ScanIcon className="w-12 h-12 mb-2" />
                        <p className="text-xs uppercase tracking-widest font-bold">Waiting for scan</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t dark:border-gray-700">
               {!extractedText ? (
                 <button 
                   onClick={handleOcr}
                   disabled={isProcessing}
                   className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {isProcessing ? <RefreshIcon className="w-5 h-5 animate-spin"/> : <ScanIcon className="w-5 h-5"/>}
                   {isProcessing ? `Processing...` : 'Extract Text from Image'}
                 </button>
               ) : (
                 <button 
                   onClick={handleDownload}
                   className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                   <DownloadIcon className="w-5 h-5"/>
                   Download as .txt
                 </button>
               )}
               <button 
                 onClick={reset}
                 disabled={isProcessing}
                 className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
               >
                 {extractedText ? 'New Scan' : 'Cancel'}
               </button>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider">Zero Uploads</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">OCR engine runs entirely via WebAssembly. Your documents stay safe and private on your device.</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider">Multi-Language</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">Supports various languages including English, Spanish, French, and Japanese for diverse document types.</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider">Smart Extraction</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">Uses Tesseract AI to recognize text layout and characters with high accuracy for clear image sources.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OcrTool;