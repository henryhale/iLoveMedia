import React, { useState } from 'react';
import { DatabaseIcon, RefreshIcon } from '../components/Icon';

const JsonCsvConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json2csv' | 'csv2json'>('json2csv');
  const [error, setError] = useState<string | null>(null);

  const convert = () => {
      setError(null);
      if (!input.trim()) return;

      try {
          if (mode === 'json2csv') {
              const jsonData = JSON.parse(input);
              const arrayData = Array.isArray(jsonData) ? jsonData : [jsonData];
              
              if (arrayData.length === 0) {
                  setOutput('');
                  return;
              }

              // Collect headers
              const headers = Array.from(new Set(arrayData.flatMap(Object.keys)));
              const csvRows = [headers.join(',')];

              for (const row of arrayData) {
                  const values = headers.map(header => {
                      const val = row[header];
                      const escaped = ('' + (val ?? '')).replace(/"/g, '\\"');
                      return `"${escaped}"`;
                  });
                  csvRows.push(values.join(','));
              }
              setOutput(csvRows.join('\n'));

          } else {
              // CSV to JSON (Basic implementation)
              const lines = input.trim().split('\n');
              if (lines.length < 1) return;
              
              const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
              const result = [];
              
              for (let i = 1; i < lines.length; i++) {
                  const obj: Record<string, string> = {};
                  // This is a naive split, it doesn't handle commas inside quotes perfectly without a complex regex
                  // For a simple demo, it works for standard simple CSVs
                  const currentline = lines[i].split(',');
                  
                  for (let j = 0; j < headers.length; j++) {
                      // Basic cleanup of quotes
                      const val = currentline[j] ? currentline[j].trim().replace(/^"|"$/g, '').replace(/\\"/g, '"') : '';
                      obj[headers[j]] = val;
                  }
                  result.push(obj);
              }
              setOutput(JSON.stringify(result, null, 2));
          }
      } catch (err) {
          setError('Invalid input format. Please check your data.');
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex-grow flex flex-col transition-colors">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <DatabaseIcon className="w-5 h-5 text-green-600 dark:text-green-400"/>
                    Data Converter
                </h2>
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button 
                        onClick={() => setMode('json2csv')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'json2csv' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        JSON → CSV
                    </button>
                    <button 
                        onClick={() => setMode('csv2json')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'csv2json' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        CSV → JSON
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-900/30">
                    {error}
                </div>
            )}

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
                <div className="flex flex-col h-full">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Input ({mode === 'json2csv' ? 'JSON' : 'CSV'})</label>
                    <textarea 
                        className="flex-grow w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder={mode === 'json2csv' ? '[{"name": "John", "age": 30}]' : 'name,age\nJohn,30'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-col h-full relative">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Output ({mode === 'json2csv' ? 'CSV' : 'JSON'})</label>
                    <textarea 
                        readOnly
                        className="flex-grow w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 font-mono text-sm resize-none text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-600"
                        value={output}
                        placeholder="Result will appear here..."
                    />
                    <div className="absolute top-8 right-2 flex flex-col gap-2">
                         <button 
                            onClick={convert}
                            className="p-2 bg-green-600 dark:bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 dark:hover:bg-green-500 transition-colors z-10"
                            title="Convert"
                        >
                            <RefreshIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
         </div>
    </div>
  );
};

export default JsonCsvConverter;