const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");

const mongoConnectionString = process.env.MONGO_URL || "mongodb://localhost:27017/test"

const cardSchema = new mongoose.Schema({
    scientific_name: {type: String, unique: true, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    imageURL: {type: String, required: true},
    rarity: {type: String, enum: ["legendary", "epic", "rare", "common"]}
})
const Card = mongoose.model("Card", cardSchema)

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    passwordHash: String,
    name: String,
    isAdmin: {type: Boolean, default: false},
    lastFreePack: {type: Number, default: -1},
    cards: [cardSchema]
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

mongoose.connect(mongoConnectionString, ()=>{
    console.log('Connected to database');
})

module.exports = { User, Card }