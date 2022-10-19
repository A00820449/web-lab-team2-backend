require("dotenv").config()
const server = require("./server")

const PORT = parseInt(process.env.PORT) || 3000

server.listen(PORT, ()=>{console.log(`Listenting on http://localhost:${PORT}`)})