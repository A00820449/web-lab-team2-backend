require("dotenv").config()
const { User, close, connect } = require("./db")

async function main() {
    await connect()
    await User.updateMany({},{lastFreePack: -1})
}

main().catch(console.error).finally(close)