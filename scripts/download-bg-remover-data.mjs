import { execSync } from "node:child_process"
import { writeFile } from "node:fs/promises"

const DATA_URL = `https://staticimgly.com/@imgly/background-removal-data/1.7.0/package.tgz`

console.log("> downloading @imgly/background-removal-data -", DATA_URL)

const res = await fetch(DATA_URL)

const archive = Buffer.from(await res.arrayBuffer())

await writeFile("./public/models/package.tgz", archive)

console.log("> download complete!")

console.log("> unpacking archive...")

execSync("gunzip --decompress --force ./public/models/package.tgz")

execSync("tar --extract --file=./public/models/package.tar -C ./public/models/")

execSync("cp -r ./public/models/package/dist/ ./public/models/imgly/")

console.log("> cleaning up...")

execSync("rm -rf ./public/models/package/dist/ ./public/models/pacakge.*")

console.log("> done!")
