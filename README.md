# BrowserBox | Documentation

BrowserBox is a high-performance, privacy-first web application providing a suite of serverless tools. All processing occurs exclusively within the user's browser using advanced technologies like WebAssembly (WASM), ensuring that sensitive data never leaves the local device.

---

## User Guide

### Introduction
BrowserBox is designed for professionals and casual users who need powerful utilities—like image conversion, audio processing, or OCR—without the privacy risks associated with uploading files to remote servers.

### Getting Started
1. **Navigation**: Use the **fixed sidebar** on the left to browse tool categories (Image, Text, Audio, Data, Security).
2. **Dashboard**: The default view provides a high-level overview of all available tools.
3. **Search**: Use the top search bar to instantly find a specific tool by name or description.
4. **Theme**: Toggle between Light and Dark mode using the switch at the bottom of the sidebar.

### Tool Catalog
*   **Image Tools**: 
    *   *OCR*: Extract text from images.
    *   *Background Remover*: Remove backgrounds using AI.
    *   *QR Studio*: Generate custom QR codes.
    *   *Emoji Art*: Convert text into patterns of emojis.
*   **Audio Tools**:
    *   *Audio Converter*: Change formats (e.g., WAV to MP3) using FFmpeg.
    *   *Text-to-Speech*: High-quality synthesis using system voices or the Kokoro AI model.
    *   *Speech-to-Text*: Live transcription via browser API or Whisper AI.
*   **Data & Security**:
    *   *JSON/CSV Converter*: Swap data formats.
    *   *Hex Viewer*: Inspect raw binary data of any file.
    *   *UUID Generator*: Bulk generate secure unique identifiers.

### PWA Installation
BrowserBox is a Progressive Web App. You can install it on your desktop or mobile home screen via the "Install App" button in the sidebar footer for an app-like experience and offline availability.

---

## 🛠 System Guide

### Architecture Overview
The application follows a modular React-based architecture. It is strictly "Serverless" in the sense that it requires no backend logic to function; all heavy lifting is delegated to browser-side libraries and WASM modules.

### Tech Stack
*   **Frontend**: React 19 (Functional Components & Hooks).
*   **Styling**: Tailwind CSS for a responsive, modern UI.
*   **Package Management**: Direct imports from `esm.sh` (No `node_modules` required in the runtime environment).
*   **AI/ML Engines**:
    *   `@imgly/background-removal`: For local image segmentation.
    *   `tesseract.js`: For Optical Character Recognition.
    *   `@xenova/transformers`: For running Whisper (Speech-to-Text) and Kokoro (TTS) models.
*   **Binary Utilities**:
    *   `@ffmpeg/ffmpeg`: Multi-format audio processing via WASM.

### Key Layout Implementation
*   **Dual-Scroll Layout**: The application uses a fixed-height container (`h-screen overflow-hidden`). Both the sidebar and the main content area have independent scroll tracks, preventing the "double scrollbar" issue common in complex web apps.
*   **State Management**: Local state (`useState`, `useMemo`) handles tool switching and search filtering. Global preferences like `theme` are persisted in `localStorage`.

### Performance Considerations
*   **Lazy Loading**: Heavy AI models (like Whisper or Kokoro) are only initialized when the user selects the corresponding tool.
*   **Memory Management**: `URL.createObjectURL` is used for handling file previews. These are revoked as needed to prevent memory leaks during long sessions.
*   **Worker Threads**: FFmpeg and Transformers.js utilize Web Workers to ensure the main UI thread remains responsive during intensive calculations.

### Security Model
The primary security feature is the **Zero-Upload Policy**.
*   **CORS**: External resources are fetched from trusted CDNs (`esm.sh`, `unpkg.com`) with strict subresource integrity where possible.
*   **Sandboxing**: All processing stays within the browser's origin sandbox.

---

## Deployment & Maintenance
To deploy BrowserBox, simply host the root directory on any static file server (GitHub Pages, Vercel, Netlify).
Ensure the `manifest.json` and `sw.js` are served correctly to maintain PWA capabilities.

*Developed by the BrowserBox Team. Licensed under MIT.*
