require("dotenv").config()
const { Card, close, connect } = require("./db")
const fs = require("fs/promises")
const path = require("path")
const csv = require("csv-parse/sync")

/**
 * @type {import("axios").AxiosStatic}
 */
const axios = require("axios")

async function downloadCSV() {
    const {data} = await axios("https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyL4gHRWO6JLU4qUmgk09WckuHYmKbG_6qD8yznSJMQTbz-iga2ajFzb74Rvru_WAYbupFOGuA4gB/pub?gid=0&single=true&output=csv", {method: "GET"})
    return data
}

async function main() {
    let fileContents = ""
    if (!process.argv[2]) {
        fileContents = await downloadCSV()
    }
    else {
        fileContents = (await fs.readFile(path.resolve(__dirname, process.argv[2]))).toString()
    }
    
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
