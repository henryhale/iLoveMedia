import React, { useState } from 'react';
import { CopyIcon, CheckIcon, RefreshIcon } from '../components/Icon';

const TextUtilities: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const transform = (type: 'upper' | 'lower' | 'title' | 'base64enc' | 'base64dec' | 'reverse' | 'trim') => {
    let result = text;
    try {
        switch (type) {
        case 'upper':
            result = text.toUpperCase();
            break;
        case 'lower':
            result = text.toLowerCase();
            break;
        case 'title':
            result = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            break;
        case 'base64enc':
            result = btoa(text);
            break;
        case 'base64dec':
            try {
                result = atob(text);
            } catch (e) {
                alert('Invalid Base64 string');
            }
            break;
        case 'reverse':
            result = text.split('').reverse().join('');
            break;
        case 'trim':
            result = text.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
            break;
        }
        setText(result);
    } catch (e) {
        console.error("Transform error", e);
    }
  };

  const btnClass = "px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors";
  const primaryBtnClass = "px-3 py-2 text-sm font-medium bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md transition-colors";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col transition-colors">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Text Workshop</h2>
                <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{text.length} chars</span>
                    <span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <button onClick={() => transform('upper')} className={btnClass}>UPPERCASE</button>
                <button onClick={() => transform('lower')} className={btnClass}>lowercase</button>
                <button onClick={() => transform('title')} className={btnClass}>Title Case</button>
                <button onClick={() => transform('reverse')} className={btnClass}>esreveR</button>
                
                <button onClick={() => transform('base64enc')} className={primaryBtnClass}>Base64 Encode</button>
                <button onClick={() => transform('base64dec')} className={primaryBtnClass}>Base64 Decode</button>
                <button onClick={() => transform('trim')} className={btnClass}>Trim Lines</button>
                 <button onClick={() => setText('')} className="px-3 py-2 text-sm font-medium bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md transition-colors flex items-center justify-center gap-1">
                    <RefreshIcon className="w-3 h-3" /> Clear
                </button>
            </div>
            
            <div className="relative flex-grow min-h-[400px]">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste text here..."
                    className="w-full h-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600"
                />
                <button 
                    onClick={handleCopy}
                    className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
                    title="Copy to clipboard"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400"/> : <CopyIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"/>}
                </button>
            </div>
         </div>
    </div>
  );
};

export default TextUtilities;