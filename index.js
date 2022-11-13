require("dotenv").config()
const server = require("./server")
const {connect, close} = require("./db")

const PORT = parseInt(process.env.PORT) || 3000

connect().then(()=>{
    server.listen(PORT, ()=>{console.log(`Listenting on http://localhost:${PORT}`)})    
}).catch(console.error)