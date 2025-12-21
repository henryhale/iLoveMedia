import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon, RefreshIcon, KeyIcon } from '../components/Icon';

const UuidGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState<number>(5);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = () => {
    const newUuids = [];
    for (let i = 0; i < count; i++) {
        // Modern browsers only
        newUuids.push(crypto.randomUUID());
    }
    setUuids(newUuids);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedIndex(-1); // -1 special flag for 'all'
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <KeyIcon className="w-5 h-5 text-green-600 dark:text-green-400"/>
                    UUID Generator
                </h2>
                <div className="flex items-center gap-3">
                     <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Count:</label>
                     <input 
                        type="number" 
                        min="1" 
                        max="50" 
                        value={count} 
                        onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                        className="w-16 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-1 px-2 text-sm focus:ring-green-500 focus:border-green-500"
                    />
                    <button 
                        onClick={generate}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="Regenerate"
                    >
                        <RefreshIcon className="w-5 h-5"/>
                    </button>
                </div>
             </div>

             <div className="space-y-3">
                 {uuids.map((uuid, idx) => (
                     <div key={idx} className="flex items-center gap-2 group">
                         <div className="flex-grow font-mono text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm truncate">
                             {uuid}
                         </div>
                         <button 
                            onClick={() => handleCopy(uuid, idx)}
                            className="p-2 text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors"
                         >
                             {copiedIndex === idx ? <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400"/> : <CopyIcon className="w-5 h-5"/>}
                         </button>
                     </div>
                 ))}
             </div>

             <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button 
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                    {copiedIndex === -1 ? <CheckIcon className="w-4 h-4"/> : <CopyIcon className="w-4 h-4"/>}
                    {copiedIndex === -1 ? 'Copied All' : 'Copy All'}
                </button>
             </div>
         </div>
    </div>
  );
};

export default UuidGenerator;