require("dotenv").config()
const { User, close, connect } = require("./db")
const { writeFile } = require("node:fs/promises")
const path = require("node:path")

async function main() {
    await connect()
    await User.updateMany({},{lastFreePack: -1})
    await writeFile(path.resolve(__dirname, "routes", "_pack"), JSON.stringify(0))
}

main().catch(console.error).finally(()=>close().catch(console.error))