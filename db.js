const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");

const mongoConnectionString = process.env.MONGO_URL || "mongodb://localhost:27017/test"

const cardSchema = new mongoose.Schema({
    scientific_name: {type: String, unique: true, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    image_url: {type: String},
    rarity: {type: String, enum: ["legendary", "epic", "rare", "common"]},
})
const Card = mongoose.model("Card", cardSchema)

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true, index: true},
    passwordHash: String,
    name: String,
    isAdmin: {type: Boolean, default: false},
    lastFreePack: {type: Number, default: -1},
    packQuantity: {type: Number, default: 0},
    cards: {
        type: [{
            card: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Card"
            },
            quantity: {type: Number, default: 1}
        }],
        defaut: []
    }
})
userSchema.method("setPassword", async function (password){
    const hash = await bcrypt.hash(password, 10)
    this.passwordHash = hash
    await this.save()
    return hash
})
userSchema.method("validatePassword", async function (password){
    const match = await bcrypt.compare(password, this.passwordHash)
    return match
})
const User = mongoose.model("User", userSchema)

const appDataSchema = new mongoose.Schema({
    current_pack: {type: Number, default: 0}
})
const AppData = mongoose.model("AppData", appDataSchema)

function connect() {
    return new Promise((res, rej)=>{
        mongoose.connect(mongoConnectionString)
        mongoose.connection.once("open", ()=>{
            console.log('Connected to database')
            res()
        })
        mongoose.connection.on("error", (e)=>{
            rej(e)
        })
    })
}

module.exports = { User, Card, AppData, close: mongoose.disconnect, connect }