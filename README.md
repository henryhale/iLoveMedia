<div align=center>

# i💙Media

![](./public/screenshot.png)

</div>

## Overview

iLoveMedia is a high-performance, privacy-first web application providing a suite of serverless tools. All processing occurs exclusively within the user's browser using advanced technologies like WebAssembly (WASM), ensuring that sensitive data never leaves the local device.

It is designed for anyone who needs powerful utilities like image conversion, audio processing, or OCR without the privacy risks associated with uploading files to remote servers.

## Live Demo

Try it yourself today: [Go to i💙Media website](https://henryhale.github.io/iLoveMeida) :rocket:

## Features

> [!IMPORTANT]
> Special thanks to every developer has worked (and still working) on all these amazing opensource projects.

- **Image Tools**:
    - [x] Image to Text (OCR): Extract text from images using [Tesseract.js](https://github.com/naptha/tesseract.js/) by [@naptha](https://github.com/naptha/)
    - [x] Background Remover: Remove backgrounds using [imgly/background-removal-js](https://github.com/imgly/background-removal-js) by [@imgly](https://github.com/imgly/)
    - [x] QR Studio: Generate custom QR codes using [qrcode](http://github.com/soldair/node-qrcode) by [@soldair](http://github.com/soldair/)
    - [x] Image Converter: Convert text into patterns of emojis using [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
    - [x] Profile Pic Creator: Create unique emoji avatars with custom backgrounds and shapes using [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- **Audio Tools**:
    - [x] Audio Recorder: Record audio from your microphone using [WebStream Recording API - Media Recorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
    - [x] Audio Converter: Change audio formats (e.g., WAV to MP3) using [@ffmpeg/ffmpeg - wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) by [@ffmpegwasm](https://github.com/ffmpegwasm/)
    - [x] Text-to-Speech: High-quality synthesis using [WebSpeech API - Speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) and [@diffusionstudio/vits-web](https://github.com/diffusionstudio/vits-web) by [@diffusionstudio](https://github.com/diffusionstudio/) and [@rhasspy](https://github.com/rhasspy/piper)
    - [x] Speech-to-Text: Live transcription using [WebSpeech API - Speech Recognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) and [whisper-web](https://github.com/xenova/whisper-web) by [@xenova](https://github.com/xenova/).
- **Video Tools**:
    - [x] Video Converter: Change video formats (e.g, MP4 to MKV) using [@ffmpeg/ffmpeg - wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) by [@ffmpegwasm](https://github.com/ffmpegwasm/)
    - [x] Video Recorder: Record videos from your webcam using [WebStream Recording API - Media Recorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
    - [x] Screen Recorder: Record your screen using [WebStream Recording API - Media Recorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

To run these tools in the browser, the following projects have tremendously made it so easy - a big shoutout to them;

- Running machine learning models in the browser - [ONNX Runtime - Web](https://github.com/Microsoft/onnxruntime) by [@Microsoft](https://github.com/Microsoft)
- Running transformers in the browser - [@xenova/transformers](https://github.com/xenova/transformers.js) by [@xenova](https://github.com/xenova/)
- Using Web APIs seamlessly - [vueuse](https://vueuse.org) by [@antfu](https://github.com/antfu)

## Project Setup

To setup iLoveMedia locally, follow the steps below;

- Clone this repository

```sh
git clone https://github.com/henryhale/iLoveMedia.git
```

- Install all dependencies

```sh
pnpm install
```

- Run dev server

```sh
pnpm dev
```

- Build for production

```sh
pnpm build
```

## Contributions

I'm glad you checked out iLoveMedia. Thank you very much.
All contributions are welcome.
For any bug or issue, kindly open one [here](https://github.com/henryhale/iLoveMedia/issues).

## License

Copyright (c) 2025-present [Henry Hale](https://github.com/henryhale/).

Released under the [MIT License](https://github.com/henryhale/iLoveMedia/blob/master/LICENSE.txt).
