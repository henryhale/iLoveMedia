import React, { useState, useRef, useCallback } from 'react';
import { DownloadIcon, RefreshIcon, ImageIcon, CheckIcon } from '../components/Icon';
import { FileState } from '../types';

const ImageConverter: React.FC = () => {
  const [fileState, setFileState] = useState<FileState>(null);
  const [targetFormat, setTargetFormat] = useState<string>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.9);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setFileState({
        file,
        previewUrl,
        type: file.type,
        size: file.size
      });
      setShowSuccess(false);
    }
  };

  const handleConvert = useCallback(() => {
    if (!fileState || !canvasRef.current) return;
    setIsProcessing(true);
    setShowSuccess(false);

    const img = new Image();
    img.src = fileState.previewUrl;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fill white background for JPEG/Transparency handling
        if (targetFormat === 'image/jpeg') {
             ctx.fillStyle = '#FFFFFF';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const ext = targetFormat.split('/')[1];
            a.download = `converted-image.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
            
            // Success animation feedback
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          }
          setIsProcessing(false);
        }, targetFormat, quality);
      }
    };
  }, [fileState, targetFormat, quality]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400"/>
            Image Converter
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Convert images between formats locally. Your photos never leave your browser.</p>
        
        {!fileState ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6"/>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Drop an image here</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">or click to upload (PNG, JPG, WEBP)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                     <img src={fileState.previewUrl} alt="Preview" className="max-w-full max-h-64 object-contain shadow-sm rounded-md" />
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{fileState.file.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatSize(fileState.size)} • {fileState.type}</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Format</label>
                            <select 
                                value={targetFormat} 
                                onChange={(e) => setTargetFormat(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border py-2 px-3"
                            >
                                <option value="image/jpeg">JPEG</option>
                                <option value="image/png">PNG</option>
                                <option value="image/webp">WEBP</option>
                            </select>
                        </div>

                        {targetFormat !== 'image/png' && (
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quality ({Math.round(quality * 100)}%)</label>
                                <input 
                                    type="range" 
                                    min="0.1" 
                                    max="1" 
                                    step="0.1" 
                                    value={quality} 
                                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button 
                            onClick={handleConvert}
                            disabled={isProcessing}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
                              showSuccess 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-500'
                            }`}
                        >
                            {isProcessing ? (
                              <RefreshIcon className="animate-spin w-4 h-4"/>
                            ) : showSuccess ? (
                              <CheckIcon className="w-4 h-4 animate-in zoom-in duration-300"/>
                            ) : (
                              <DownloadIcon className="w-4 h-4"/>
                            )}
                            
                            {isProcessing 
                              ? 'Converting...' 
                              : showSuccess 
                                ? 'Converted!' 
                                : 'Convert & Download'}
                        </button>
                        <button 
                            onClick={() => {
                              setFileState(null);
                              setShowSuccess(false);
                            }}
                            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageConverter;