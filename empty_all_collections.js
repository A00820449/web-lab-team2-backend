require("dotenv").config()
const { User, close, connect } = require("./db")

async function main() {
    await connect()
    await User.updateMany({},{cards: []})
}

main().catch(console.error).finally(()=>close().catch(console.error))