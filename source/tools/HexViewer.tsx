import React, { useState, useCallback, useEffect } from 'react';
import { FileCodeIcon, RefreshIcon } from '../components/Icon';

interface HexRow {
  offset: string;
  bytes: string[];
  ascii: string;
}

const BYTES_PER_ROW = 16;
const CHUNK_SIZE = 1024 * 5; // Load 5KB at a time for performance

const HexViewer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Uint8Array | null>(null);
  const [rows, setRows] = useState<HexRow[]>([]);
  const [viewLimit, setViewLimit] = useState(CHUNK_SIZE);
  const [loading, setLoading] = useState(false);

  const processData = useCallback((buffer: Uint8Array, limit: number) => {
    const newRows: HexRow[] = [];
    const end = Math.min(buffer.length, limit);

    for (let i = 0; i < end; i += BYTES_PER_ROW) {
      const rowBytes: string[] = [];
      let ascii = '';
      
      for (let j = 0; j < BYTES_PER_ROW; j++) {
        const byteIndex = i + j;
        if (byteIndex < buffer.length) {
          const byte = buffer[byteIndex];
          rowBytes.push(byte.toString(16).padStart(2, '0').toUpperCase());
          // Printable ASCII characters (32-126)
          ascii += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
        } else {
          rowBytes.push('  ');
          ascii += ' ';
        }
      }

      newRows.push({
        offset: i.toString(16).padStart(8, '0').toUpperCase(),
        bytes: rowBytes,
        ascii: ascii
      });
    }
    setRows(newRows);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setLoading(true);
      setViewLimit(CHUNK_SIZE);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const buffer = new Uint8Array(event.target.result as ArrayBuffer);
          setData(buffer);
          processData(buffer, CHUNK_SIZE);
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleLoadMore = () => {
    if (data) {
      const newLimit = viewLimit + CHUNK_SIZE;
      setViewLimit(newLimit);
      processData(data, newLimit);
    }
  };

  const reset = () => {
    setFile(null);
    setData(null);
    setRows([]);
    setViewLimit(CHUNK_SIZE);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <FileCodeIcon className="w-5 h-5 text-green-600 dark:text-green-400"/>
          Hex / Binary Viewer
        </h2>
        
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative">
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                    <FileCodeIcon className="w-6 h-6"/>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Open any file</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">View its raw binary contents safely in-browser</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded flex items-center justify-center text-green-600">
                        <FileCodeIcon className="w-6 h-6"/>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{ (file.size / 1024).toFixed(2) } KB • {file.type || 'unknown type'}</p>
                    </div>
                </div>
                <button 
                  onClick={reset}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <RefreshIcon className="w-4 h-4"/>
                  Close
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <RefreshIcon className="w-8 h-8 text-green-500 animate-spin"/>
                    <p className="text-gray-500">Reading file bytes...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-left border-collapse bg-white dark:bg-gray-950">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs font-mono uppercase tracking-wider">
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 w-24">Offset</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 text-center">Hex Data (Bytes 0-F)</th>
                                    <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 w-40">ASCII</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono text-sm">
                                {rows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                                        <td className="px-4 py-1 text-green-600 dark:text-green-400 font-bold bg-gray-50 dark:bg-gray-900/30 border-r border-gray-200 dark:border-gray-800 select-none">
                                            {row.offset}
                                        </td>
                                        <td className="px-4 py-1 text-gray-700 dark:text-gray-300">
                                            <div className="flex justify-between gap-1">
                                                {row.bytes.map((byte, bIdx) => (
                                                    <span 
                                                        key={bIdx} 
                                                        className={`inline-block w-6 text-center ${byte === '00' ? 'text-gray-300 dark:text-gray-700' : ''}`}
                                                    >
                                                        {byte}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-1 text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-800 whitespace-pre">
                                            {row.ascii}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {data && viewLimit < data.length && (
                        <div className="flex flex-col items-center gap-2 pt-4">
                            <p className="text-xs text-gray-500">Showing {Math.min(viewLimit, data.length)} of {data.length} bytes</p>
                            <button 
                                onClick={handleLoadMore}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
                            >
                                Load more bytes...
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Technical Insight</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                This viewer reads the file directly as an <code>ArrayBuffer</code> and visualizes the raw bytes using hexadecimal encoding. 
                Printable characters are displayed in the ASCII column, while others are replaced with placeholders (dots). 
                Large files are lazy-loaded to ensure your browser remains responsive.
            </p>
        </div>
      </div>
    </div>
  );
};

export default HexViewer;