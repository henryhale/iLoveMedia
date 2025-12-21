import React, { useState, useEffect, useMemo } from 'react';
import { ToolCategory, ToolDef } from './types';
import ImageConverter from './tools/ImageConverter';
import TextUtilities from './tools/TextUtilities';
import UuidGenerator from './tools/UuidGenerator';
import JsonCsvConverter from './tools/JsonCsvConverter';
import AudioRecorder from './tools/AudioRecorder';
import AudioConverter from './tools/AudioConverter';
import HexViewer from './tools/HexViewer';
import EmojiArtGenerator from './tools/EmojiArtGenerator';
import ProfilePictureCreator from './tools/ProfilePictureCreator';
import TextToSpeech from './tools/TextToSpeech';
import SpeechToText from './tools/SpeechToText';
import QrCodeGenerator from './tools/QrCodeGenerator';
import BackgroundRemover from './tools/BackgroundRemover';
import OcrTool from './tools/OcrTool';
import {
  ImageIcon, FileTextIcon, KeyIcon, DatabaseIcon,
  ArrowRightIcon, HomeIcon, MenuIcon, XIcon, SunIcon, MoonIcon, SearchIcon,
  MicIcon, MusicIcon, FileCodeIcon, SmileIcon, UserIcon, Volume2Icon, WavesIcon, QrCodeIcon,
  AppWindowIcon, ScissorIcon, ScanIcon, GithubIcon, HelpCircleIcon, ChevronDownIcon
} from './components/Icon';

const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const tools: ToolDef[] = useMemo(() => [
    {
      id: 'ocr-tool',
      name: 'Image to Text (OCR)',
      description: 'Convert scanned documents and images into editable text using AI.',
      icon: <ScanIcon className="w-6 h-6" />,
      category: ToolCategory.IMAGE,
      component: <OcrTool />
    },
    {
      id: 'bg-remover',
      name: 'Background Remover',
      description: 'AI-powered background removal directly in your browser.',
      icon: <ScissorIcon className="w-6 h-6" />,
      category: ToolCategory.IMAGE,
      component: <BackgroundRemover />
    },
    {
      id: 'image-converter',
      name: 'Image Converter',
      description: 'Convert images to PNG, JPEG, or WEBP instantly in your browser.',
      icon: <ImageIcon className="w-6 h-6" />,
      category: ToolCategory.IMAGE,
      component: <ImageConverter />
    },
    {
      id: 'qr-gen',
      name: 'QR Code Studio',
      description: 'Create high-resolution QR codes with custom colors and formats.',
      icon: <QrCodeIcon className="w-6 h-6" />,
      category: ToolCategory.IMAGE,
      component: <QrCodeGenerator />
    },
    {
      id: 'pfp-creator',
      name: 'Profile Pic Creator',
      description: 'Create unique emoji avatars with custom backgrounds and shapes.',
      icon: <UserIcon className="w-6 h-6" />,
      category: ToolCategory.IMAGE,
      component: <ProfilePictureCreator />
    },
    {
      id: 'emoji-art',
      name: 'Emoji Art',
      description: 'Convert text into fun emoji-based patterns and download as images.',
      icon: <SmileIcon className="w-6 h-6" />,
      category: ToolCategory.IMAGE,
      component: <EmojiArtGenerator />
    },
    {
      id: 'tts',
      name: 'Text to Speech',
      description: 'Convert written text into natural human speech using local AI.',
      icon: <Volume2Icon className="w-6 h-6" />,
      category: ToolCategory.AUDIO,
      component: <TextToSpeech />
    },
    {
      id: 'stt',
      name: 'Speech to Text',
      description: 'Transcribe your voice recordings into text accurately in real-time.',
      icon: <WavesIcon className="w-6 h-6" />,
      category: ToolCategory.AUDIO,
      component: <SpeechToText />
    },
    {
      id: 'audio-recorder',
      name: 'Audio Recorder',
      description: 'Record audio from your microphone and download locally.',
      icon: <MicIcon className="w-6 h-6" />,
      category: ToolCategory.AUDIO,
      component: <AudioRecorder />
    },
    {
      id: 'audio-converter',
      name: 'Audio Converter',
      description: 'Convert audio formats (MP3, WAV, etc.) using FFmpeg WASM.',
      icon: <MusicIcon className="w-6 h-6" />,
      category: ToolCategory.AUDIO,
      component: <AudioConverter />
    },
    {
      id: 'hex-viewer',
      name: 'Hex Viewer',
      description: 'Inspect raw file bytes and binary data in a classic hex dump format.',
      icon: <FileCodeIcon className="w-6 h-6" />,
      category: ToolCategory.DATA,
      component: <HexViewer />
    },
    {
      id: 'text-utils',
      name: 'Text Workshop',
      description: 'Case conversion, Base64 encoding/decoding, and text cleanup.',
      icon: <FileTextIcon className="w-6 h-6" />,
      category: ToolCategory.TEXT,
      component: <TextUtilities />
    },
    {
      id: 'uuid-gen',
      name: 'UUID Generator',
      description: 'Generate bulk secure version-4 UUIDs locally.',
      icon: <KeyIcon className="w-6 h-6" />,
      category: ToolCategory.SECURITY,
      component: <UuidGenerator />
    },
    {
      id: 'json-csv',
      name: 'JSON <> CSV',
      description: 'Convert data between JSON and CSV formats.',
      icon: <DatabaseIcon className="w-6 h-6" />,
      category: ToolCategory.DATA,
      component: <JsonCsvConverter />
    },
  ], []);

  const activeTool = tools.find(t => t.id === activeToolId);

  // Fix: Explicitly type filteredTools as ToolDef[] to avoid 'unknown' inference in map calls
  const filteredTools = useMemo<ToolDef[]>(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.category.toLowerCase().includes(lowerQuery)
    );
  }, [tools, searchQuery]);

  // Fix: Explicitly type groupedTools to ensure categoryTools is correctly inferred as ToolDef[]
  const groupedTools = useMemo<Record<string, ToolDef[]>>(() => {
    const groups: Record<string, ToolDef[]> = {};
    const categories = Object.values(ToolCategory);

    categories.forEach(cat => {
      const categoryTools = filteredTools.filter(t => t.category === cat);
      if (categoryTools.length > 0) {
        groups[cat] = categoryTools;
      }
    });

    return groups;
  }, [filteredTools]);

  const handleNavClick = (id: string | null) => {
    setActiveToolId(id);
    setIsSidebarOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-row transition-colors duration-300 overflow-hidden">

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, Overlay on mobile */}
      <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0 md:flex flex-col h-screen shrink-0
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick(null)}>
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">B</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">BrowserBox</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Nav - Scrollable Area */}
        <nav className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar scroll-smooth">
          <button
            onClick={() => handleNavClick(null)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeToolId === null ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <HomeIcon className="w-5 h-5" />
            Dashboard
          </button>

          {/* Fix: Cast Object.entries result to ensure categoryTools is correctly typed as ToolDef[] */}
          {(Object.entries(groupedTools) as [string, ToolDef[]][]).map(([category, categoryTools]) => {
            const isCollapsed = collapsedCategories.has(category);
            return (
              <div key={category} className="pt-4 pb-1">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-4 mb-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] group hover:text-green-500 transition-colors"
                >
                  <span>{category} Tools</span>
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
                  >
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={`space-y-0.5 transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
                  {categoryTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleNavClick(tool.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeToolId === tool.id ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <span className={`${activeToolId === tool.id ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {React.cloneElement(tool.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                      </span>
                      {tool.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {Object.keys(groupedTools).length === 0 && searchQuery && (
            <div className="p-4 text-center text-xs text-gray-400 italic">No tools match your search.</div>
          )}
        </nav>

        {/* Sidebar Footer - Stick to Bottom */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1 shrink-0 bg-white dark:bg-gray-900 mt-auto">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="flex items-center gap-3">
              {theme === 'light' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </span>
            <span className="relative w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors">
              <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
            </span>
          </button>

          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group animate-in slide-in-from-bottom-2"
            >
              <AppWindowIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Install App
            </button>
          )}
        </div>
      </aside>

      {/* Main Content - Independent Scrollable Area */}
      <main className="flex-1 min-w-0 h-screen flex flex-col relative overflow-hidden bg-gray-50 dark:bg-gray-950">

        {/* Main Content Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-4 sticky top-0 z-30 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md shrink-0"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          <div className="relative flex-1 max-w-xl">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredTools.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Matching Tools</div>
                    {filteredTools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => handleNavClick(tool.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors group"
                      >
                        <div className="text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {React.cloneElement(tool.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{tool.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] md:max-w-xs">{tool.description}</div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    <p>No tools found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Items */}
          <div className="hidden md:flex items-center gap-1 lg:gap-3 ml-auto">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert("Documentation and support portal coming soon!"); }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
              title="Support & Documentation"
            >
              <HelpCircleIcon className="w-5 h-5" />
              <span className="hidden lg:inline">Support</span>
            </a>
            
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              title="View on GitHub"
            >
              <GithubIcon className="w-5 h-5" />
            </a>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

            <button 
              className="group flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-500">BB</div>
              <span className="hidden lg:inline">More</span>
              <ChevronDownIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {activeTool ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <button
                    onClick={() => setActiveToolId(null)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-2 flex items-center gap-1 md:hidden"
                  >
                    ← Back to Dashboard
                  </button>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-400 shadow-sm">
                      {React.cloneElement(activeTool.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{activeTool.name}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">{activeTool.category}</span>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">{activeTool.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {activeTool.component}
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-green-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-green-500/20">
                  <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Serverless Tools.</h1>
                    <p className="text-green-100 text-lg md:text-xl leading-relaxed">
                      A collection of powerful utilities that run entirely in your browser.
                      No uploads, no servers, no data tracking. 100% Private.
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 px-1 uppercase tracking-widest text-sm opacity-50">Browser Capabilities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => handleNavClick(tool.id)}
                        className="bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-transparent p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500 hover:shadow-md transition-all text-left group flex flex-col h-full"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-green-50 dark:group-hover:bg-green-900/30 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {tool.icon}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-green-500 transition-colors">{tool.category}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{tool.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                          {tool.description}
                        </p>
                        <div className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                          Launch Tool <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-20 pb-10 text-center text-sm font-normal opacity-40 grid gap-2">
                    <span>Developed by BrowserBox Team</span>
                    <div className="flex gap-2 items-center justify-center">
                      <span>Version 1.2.0</span> 
                      <span>|</span>
                      <span>Licence MIT</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
