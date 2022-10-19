const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");

const mongoConnectionString = process.env.MONGO_URL || "mongodb://localhost:27017/test"

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    passwordHash: String,
    name: String,
    isAdmin: {type: Boolean, default: false},
    gotFreePack: Boolean
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

module.exports = {User}