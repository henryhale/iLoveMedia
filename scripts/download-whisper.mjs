import fs from "fs"
import path from "path"

const MODEL_NAME = "whisper-tiny.en"
const BASE_URL = "https://huggingface.co/Xenova/whisper-tiny.en/resolve/main"

const FILES = [
    {
        path: "config.json",
        size: "2.2KB"
    },
    {
        path: "generation_config.json",
        size: "1.6KB"
    },
    {
        path: "preprocessor_config.json",
        size: "0.4KB"
    },
    {
        path: "tokenizer.json",
        size: "2.2MB"
    },
    {
        path: "tokenizer_config.json",
        size: "0.8KB"
    },
    {
        path: "special_tokens_map.json",
        size: "1.72KB"
    },
    {
        path: "onnx/encoder_model_quantized.onnx",
        size: "10.2MB"
    },
    {
        path: "onnx/decoder_model_merged_quantized.onnx",
        size: "30.8MB"
    },
]

const OUTPUT_DIR = path.resolve(
    process.cwd(),
    "public/models",
    MODEL_NAME
)

async function downloadFile(file) {
    const url = `${BASE_URL}/${file.path}`
    const outPath = path.join(OUTPUT_DIR, file.path)
    const dirPath = path.dirname(outPath)

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }

    console.log(`> downloading ${file.path} (${file.size})...`)

    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`failed to download ${file.path}`)
    }

    const buffer = await res.arrayBuffer()
    fs.writeFileSync(outPath, Buffer.from(buffer))
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    for (const file of FILES) {
        await downloadFile(file)
    }

    console.log("> whisper model downloaded successfully")
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
