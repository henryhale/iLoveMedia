import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { QrCodeIcon, DownloadIcon, RefreshIcon, CheckIcon } from '../components/Icon';

const PRESET_COLORS = [
  '#000000', '#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'
];

const QrCodeGenerator: React.FC = () => {
  const [text, setText] = useState('https://browserbox.app');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [margin, setMargin] = useState(4);
  const [size, setSize] = useState(512);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQr = useCallback(async () => {
    if (!canvasRef.current || !text) return;
    try {
      await QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: margin,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
    } catch (err) {
      console.error('QR Generation failed:', err);
    }
  }, [text, fgColor, bgColor, errorLevel, margin, size]);

  useEffect(() => {
    generateQr();
  }, [generateQr]);

  const handleDownload = async (format: 'png' | 'jpeg' | 'svg') => {
    setIsDownloading(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'svg') {
      try {
        const svgString = await QRCode.toString(text, {
          type: 'svg',
          margin: margin,
          errorCorrectionLevel: errorLevel,
          color: { dark: fgColor, light: bgColor },
        });
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qrcode-${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
      }
    } else {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const url = canvas.toDataURL(mimeType, 1.0);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.${format}`;
      a.click();
    }
    
    setTimeout(() => setIsDownloading(false), 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
            <QrCodeIcon className="w-6 h-6"/>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">QR Code Studio</h2>
            <p className="text-sm text-gray-500">Generate high-quality QR codes locally</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Controls - Move to top on mobile for flow, or keep consistent? 
              Actually, usually on mobile seeing the result is better. 
              Let's swap order on mobile so preview is at the top. */}
          <div className="order-2 lg:order-1 lg:col-span-5 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Content (URL or Text)</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com"
                className="w-full h-24 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Error Correction</label>
                <select 
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as any)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Margin ({margin}px)</label>
                <input 
                  type="range" min="0" max="20" step="1" value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 mt-2.5"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Foreground Color</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_COLORS.map(c => (
                    <button 
                      key={c} onClick={() => setFgColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-8 h-8 rounded-md border-2 transition-all ${fgColor === c ? 'border-green-500 scale-110 shadow-sm' : 'border-transparent'}`}
                    />
                  ))}
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded-md p-0 overflow-hidden cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Background Color</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setBgColor('#ffffff')} className={`w-8 h-8 bg-white border-2 rounded-md ${bgColor === '#ffffff' ? 'border-green-500' : 'border-gray-200'}`} />
                  <button onClick={() => setBgColor('#00000000')} className={`w-8 h-8 border-2 rounded-md pattern-checkered-sm ${bgColor === '#00000000' ? 'border-green-500' : 'border-gray-200'}`} title="Transparent" />
                  <input type="color" value={bgColor === '#00000000' ? '#ffffff' : bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded-md p-0 overflow-hidden cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t dark:border-gray-700 space-y-3">
               <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Download formats</label>
               <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handleDownload('png')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 text-[10px] sm:text-xs transition-all active:scale-95 shadow-sm">
                    <DownloadIcon className="w-4 h-4"/> PNG
                  </button>
                  <button onClick={() => handleDownload('svg')} className="bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 text-[10px] sm:text-xs transition-all active:scale-95 shadow-sm">
                    <DownloadIcon className="w-4 h-4"/> SVG
                  </button>
                  <button onClick={() => handleDownload('jpeg')} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 text-[10px] sm:text-xs transition-all active:scale-95 shadow-sm">
                    <DownloadIcon className="w-4 h-4"/> JPG
                  </button>
               </div>
            </div>
          </div>

          {/* Preview */}
          <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full aspect-square bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-700 flex items-center justify-center p-4 sm:p-8 pattern-checkered relative overflow-hidden min-h-[280px]">
               <div className="bg-white p-2 sm:p-4 rounded-xl shadow-2xl animate-in zoom-in duration-500 flex items-center justify-center max-w-[85%] sm:max-w-full">
                  <canvas ref={canvasRef} className="max-w-full h-auto rounded-sm" style={{ width: '100%', maxWidth: '340px', height: 'auto' }} />
               </div>
               
               <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm z-10">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 whitespace-nowrap">Live Preview</span>
               </div>
            </div>
            
            <p className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-gray-400 text-center max-w-sm px-4">
               Error Correction Level: Higher levels allow the QR to be readable even if dirty or damaged, but makes the pattern denser.
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        .pattern-checkered {
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px);
          background-position: 0 0, 10px 10px;
          background-size: 20px 20px;
        }
        .pattern-checkered-sm {
          background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        }
        .dark .pattern-checkered {
          background-image: radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
};

export default QrCodeGenerator;