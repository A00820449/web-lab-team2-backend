require("dotenv").config()
const { Card, User, CardInCollection, close, connect } = require("./db")
const { exit } = require("node:process")

async function main() {
    await connect(process.env.MONGO_URL)

    const auser = await User.findOne({username: "aaaaaaaa"})
    const acard = await Card.findById("6373f67e06f10a016395f4b1")
    //const acard = await Card.findById("6373f67e06f10a016395f4af")

    if (!auser || !acard) {
        return
    }

    const auser_id = auser._id.toString()
    const acard_id = acard._id.toString()

    const acardincol = await CardInCollection.findOne({user_id: auser_id, card_id: acard_id})

    if (!acardincol) {
        console.log(await CardInCollection.create({user_id: auser_id, card_id: acard_id, quantity: 1}))
        return await close()
    }

    console.log(acardincol)

    await close()
}

main().catch((e)=>{
    console.error(e)
    close().finally(()=>{exit(1)})
})