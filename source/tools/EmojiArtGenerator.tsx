import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SmileIcon, DownloadIcon, RefreshIcon, CopyIcon, CheckIcon, SearchIcon } from '../components/Icon';

const EMOJI_SETS = [
  {
    name: 'Smileys',
    emojis: ['😀', '😂', '😍', '😎', '🤔', '🙄', '😴', '😇', '🥳', '🤡', '🤢', '🤯', '💀', '👻', '👽', '🤖']
  },
  {
    name: 'Hearts & Stars',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '✨', '🌟', '⭐', '💫', '🔥', '💥', '💢']
  },
  {
    name: 'Nature',
    emojis: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔']
  },
  {
    name: 'Flora',
    emojis: ['🌸', '🌹', '🌺', '🌻', '🌼', '🌷', '🌱', '🌿', '☘️', '🍀', '🍃', '🍂', '🍁', '🍄', '🌵', '🌴']
  },
  {
    name: 'Objects',
    emojis: ['💎', '💰', '💳', '🎁', '🎈', '🎨', '🎬', '🎤', '🎧', '🎸', '🎹', '🎮', '🕹️', '📱', '💻', '💡']
  },
  {
    name: 'Places & Travel',
    emojis: ['🚀', '🛸', '✈️', '🚢', '🚗', '🚲', '🗼', '🗽', '🏯', '🏰', '🌈', '☀️', '☁️', '⛈️', '❄️', '🌊']
  },
  {
    name: 'Symbols',
    emojis: ['✅', '❌', '⚠️', '🚫', '💯', '🆘', '🅰️', '🅱️', '🅾️', '🈲', '㊗️', '㊙️', '🈯', '💹', '🌀', '🌐']
  }
];

const EmojiArtGenerator: React.FC = () => {
  const [text, setText] = useState('HELLO');
  const [emoji, setEmoji] = useState('🔥');
  const [activeCategory, setActiveCategory] = useState(EMOJI_SETS[1].name); // Hearts & Stars
  const [density, setDensity] = useState(15);
  const [fontSize, setFontSize] = useState(40);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const generateArt = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 1. Measure text to size the hidden canvas
    ctx.font = `bold ${fontSize}px sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = fontSize * 1.2;

    // Resize hidden canvas to fit text snugly
    canvas.width = textWidth || 1;
    canvas.height = textHeight || 1;
    
    // 2. Draw text on hidden canvas
    ctx.fillStyle = 'black';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, canvas.height / 2);

    // 3. Sample pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // 4. Draw on preview canvas
    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas?.getContext('2d');
    if (!previewCanvas || !previewCtx) return;

    const spacing = density;
    const outputWidth = canvas.width * spacing;
    const outputHeight = canvas.height * spacing;

    previewCanvas.width = outputWidth;
    previewCanvas.height = outputHeight;

    previewCtx.clearRect(0, 0, outputWidth, outputHeight);
    previewCtx.font = `${spacing}px serif`;
    previewCtx.textAlign = 'center';
    previewCtx.textBaseline = 'middle';

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const alpha = pixels[index + 3];
        
        // If the pixel is filled (black text)
        if (alpha > 128) {
          previewCtx.fillText(emoji, x * spacing + spacing / 2, y * spacing + spacing / 2);
        }
      }
    }
  }, [text, emoji, density, fontSize]);

  useEffect(() => {
    generateArt();
  }, [generateArt]);

  const handleDownload = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);
    
    const link = document.createElement('a');
    link.download = `emoji-art-${text.toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    setTimeout(() => setIsDownloading(false), 1000);
  };

  const copyToClipboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let artString = '';
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const alpha = pixels[index + 3];
        artString += (alpha > 128) ? emoji : '⬜'; // Use white square for empty space in text mode
      }
      artString += '\n';
    }

    navigator.clipboard.writeText(artString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeEmojis = EMOJI_SETS.find(set => set.name === activeCategory)?.emojis || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
          <SmileIcon className="w-6 h-6 text-green-500"/>
          Emoji Art Studio
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-6 lg:border-r dark:border-gray-700 lg:pr-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 mb-2.5">Text Content</label>
                <input 
                  type="text" 
                  value={text} 
                  onChange={(e) => setText(e.target.value.toUpperCase().slice(0, 20))}
                  placeholder="Type something..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold tracking-tight text-base"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 mb-2.5">Emoji Selector</label>
                
                {/* Category Tabs - Horizontally scrollable */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-1 custom-scrollbar no-scrollbar scroll-smooth">
                  {EMOJI_SETS.map(set => (
                    <button
                      key={set.name}
                      onClick={() => setActiveCategory(set.name)}
                      className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === set.name ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      {set.name}
                    </button>
                  ))}
                </div>

                {/* Emoji Grid */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 grid grid-cols-5 gap-3 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {activeEmojis.map(e => (
                    <button 
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`w-11 h-11 text-2xl flex items-center justify-center rounded-xl border-2 transition-all ${emoji === e ? 'bg-white dark:bg-gray-800 border-green-500 shadow-sm scale-105 z-10' : 'bg-transparent border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      {e}
                    </button>
                  ))}
                  <div className="col-span-1 flex items-center justify-center">
                    <input 
                      type="text" 
                      maxLength={2}
                      placeholder="+"
                      value={emoji.length > 2 ? '' : emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="w-11 h-11 text-center text-xl bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      title="Custom Emoji"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">Resolution ({density}px)</label>
                    <span className="text-[10px] font-mono text-gray-400 font-bold">{density}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="8" 
                    max="40" 
                    step="1" 
                    value={density} 
                    onChange={(e) => setDensity(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">Font Weight ({fontSize}px)</label>
                    <span className="text-[10px] font-mono text-gray-400 font-bold">{fontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="120" 
                    step="5" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={handleDownload}
                disabled={!text}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isDownloading ? <RefreshIcon className="w-5 h-5 animate-spin"/> : <DownloadIcon className="w-5 h-5"/>}
                Download PNG
              </button>
              <button 
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-[0.98]"
              >
                {copied ? <CheckIcon className="w-5 h-5 text-emerald-500"/> : <CopyIcon className="w-5 h-5"/>}
                {copied ? 'Copied Text Art!' : 'Copy as Text'}
              </button>
            </div>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-8 flex flex-col items-center">
            <div className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-auto flex items-center justify-center p-6 md:p-12 min-h-[450px] pattern-checkered relative">
              <div className="relative animate-in zoom-in duration-500">
                <canvas ref={previewCanvasRef} className="max-w-full h-auto shadow-2xl rounded-2xl bg-white dark:bg-gray-800 transition-transform hover:scale-[1.01] duration-300" />
                {!text && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-4">
                    <SmileIcon className="w-16 h-16 opacity-10" />
                    <p className="font-bold text-sm uppercase tracking-widest">Enter text to start</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex items-center gap-5">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Rendering Live</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium italic">
                {text ? `Applying ${emoji} pattern to "${text}"` : 'Awaiting input...'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Hidden processing canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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

export default EmojiArtGenerator;