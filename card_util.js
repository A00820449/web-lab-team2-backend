require("dotenv").config()
const { Card, close, connect } = require("./db")
const fs = require("fs/promises")
const path = require("path")
const csv = require("csv-parse/sync")

async function main() {
    const file = process.argv[2]
    if (!file) {
        throw new Error("Usage: node card_util <csv_filename>")
    }

    const fileContents = await fs.readFile(path.resolve(__dirname, file))
    
    const parsed = csv.parse(fileContents, {
        columns: true,
        skip_empty_lines: true
    })
    console.log(parsed)
    
    if (!parsed) {
        return
    }
    
    await connect()

    await Promise.all(parsed.map(async (elem)=>{
        try {
            const newCard = await Card.create(elem)
            console.log("saved:", {id: newCard._id, name: newCard.name})
        }
        catch(e) {
            console.error("couldn't save:", elem?.name)
        }
    }))
    
    await close()
}
main().catch(console.error)
