import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserIcon, DownloadIcon, RefreshIcon, CheckIcon } from '../components/Icon';

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖']
  },
  {
    name: 'Animals',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', ' beaver', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔']
  },
  {
    name: 'Food',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥣', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧋', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄']
  },
  {
    name: 'Objects',
    emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖱️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩺', '🩹', '💊', '💉', '🩸', '🧬', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🥳', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📑', '🧾', '📊', '📈', '📉', '📄', '📅', '📆', '🗓️', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓']
  }
];

const PRESET_COLORS = [
  '#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6', 
  '#06B6D4', '#D946EF', '#F97316', '#14B8A6', '#3B82F6', '#6B7280', '#000000',
  '#ffffff'
];

const ProfilePictureCreator: React.FC = () => {
  const [emoji, setEmoji] = useState('🦊');
  const [bgColor, setBgColor] = useState('#4F46E5');
  const [shape, setShape] = useState<'circle' | 'square'>('circle');
  const [emojiSize, setEmojiSize] = useState(120);
  const [rotation, setRotation] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Smileys');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawAvatar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw background
    ctx.fillStyle = bgColor;
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, size, size);
    }

    // Draw Emoji
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${emojiSize * 2}px serif`;
    ctx.fillText(emoji, 0, 5); // Small offset for optical centering
    ctx.restore();
  }, [emoji, bgColor, shape, emojiSize, rotation]);

  useEffect(() => {
    drawAvatar();
  }, [drawAvatar]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);

    const link = document.createElement('a');
    link.download = `avatar-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setShowSuccess(true);
    setTimeout(() => {
      setIsDownloading(false);
      setShowSuccess(false);
    }, 2000);
  };

  const currentCategory = EMOJI_CATEGORIES.find(cat => cat.name === activeCategory);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
          <UserIcon className="w-5 h-5 text-green-600 dark:text-green-400"/>
          Profile Picture Creator
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-8">
            {/* Shape & Emoji Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Background Shape</label>
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                  <button 
                    onClick={() => setShape('circle')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${shape === 'circle' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  >
                    Circle
                  </button>
                  <button 
                    onClick={() => setShape('square')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${shape === 'square' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  >
                    Square
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Rotation ({rotation}°)</label>
                <input 
                  type="range" 
                  min="-180" 
                  max="180" 
                  value={rotation} 
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 mt-3"
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Background Color</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {PRESET_COLORS.map(color => (
                  <button 
                    key={color}
                    onClick={() => setBgColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${bgColor === color ? 'border-green-500 ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-800' : 'border-white dark:border-gray-600'}`}
                  />
                ))}
                <div className="relative">
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-600 cursor-pointer overflow-hidden p-0"
                  />
                </div>
              </div>
            </div>

            {/* Emoji Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Choose Avatar Emoji</label>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
                  {EMOJI_CATEGORIES.map(cat => (
                    <button 
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === cat.name ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                <div className="p-3 grid grid-cols-6 gap-2 max-h-[220px] overflow-y-auto">
                  {currentCategory?.emojis.map(e => (
                    <button 
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all ${emoji === e ? 'bg-white dark:bg-gray-800 ring-2 ring-green-500 shadow-sm' : 'bg-transparent'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Emoji Size ({emojiSize}px)</label>
              <input 
                type="range" 
                min="40" 
                max="240" 
                value={emojiSize} 
                onChange={(e) => setEmojiSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>

            <button 
              onClick={handleDownload}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] ${showSuccess ? 'bg-emerald-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'}`}
            >
              {isDownloading ? <RefreshIcon className="w-5 h-5 animate-spin"/> : showSuccess ? <CheckIcon className="w-5 h-5"/> : <DownloadIcon className="w-5 h-5"/>}
              {showSuccess ? 'Saved to Downloads' : 'Download Profile Picture'}
            </button>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full aspect-square bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-700 flex items-center justify-center p-8 pattern-checkered relative">
              <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-2xl bg-white dark:bg-gray-800 transition-all duration-300" style={{ width: '380px', height: '380px' }} />
              
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">512 x 512 Canvas</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30 max-w-md text-center">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Perfect for Slack, Discord, or GitHub! Customize your background and character without any complex software.
              </p>
            </div>
          </div>
        </div>
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

export default ProfilePictureCreator;
