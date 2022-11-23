const Router = require("koa-router")
const jwt = require("jsonwebtoken")
const { Card, User, CardInCollection } = require("../db")
const { randomInt } = require("node:crypto")

const router = new Router()
const JWT_SECRET = process.env.JWT_SECRET || "secret"

const cardTotals = {legendary: 0, epic: 0, rare: 0, common: 0}

async function updateCardTotal() {
    cardTotals.legendary = await Card.countDocuments({rarity: "legendary"})
    cardTotals.epic = await Card.countDocuments({rarity: "epic"})
    cardTotals.rare = await Card.countDocuments({rarity: "rare"})
    cardTotals.common = await Card.countDocuments({rarity: "common"})
}
updateCardTotal().catch(console.error)


const probabilities = {
    legendary: 1,
    epic: 5,
    rare: 20,
    common: 74
}

const probEntries = Object.entries(probabilities)

/**
 * @type {string[]}
 */
let probArray = []
probEntries.map((val)=>{
    const newArr = Array(val[1]).fill(val[0])
    probArray = newArr.concat(probArray)
})

function getRandomRarity() {
    const index = randomInt(0, Math.max(probArray.length, 1))
    return probArray[index]
}

async function getRandomCards(n) {
    const operations = Array.from({length: n}, async ()=>{
        const rarity = getRandomRarity()
        const skip = randomInt(0, Math.max(cardTotals[rarity], 1))
        return await Card.findOne({rarity: rarity}).skip(skip)
    })
    return await Promise.all(operations)
}

/**
 * @param {string} token 
 */
function verifyAndDecodeJWT(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        return decoded
    }
    catch(e) {
        return null
    }
}

router.use(async (ctx, next)=>{
    const token = ctx.request.headers.authorization?.match(/^Bearer (.+)$/)?.[1]

    ctx.user = verifyAndDecodeJWT(token)
    await next()
})

router.get("/getall", async(ctx, next)=>{
    const receivedlimit = parseInt(ctx.request.query?.limit) || 100
    const limit = Math.min(Math.max(0, receivedlimit), 256)
    try {
        const results = await Card.find({}).limit(limit)
        ctx.body = JSON.stringify({cards: results, error: null}, null, 4)
    }
    catch(e) {
        ctx.body = {cards: null, error: e.toString()}
    }
})

router.post("/add", async (ctx, next) => {
    if (!ctx.user?.isAdmin) {
        return
    }
    try {
        const newCard = await Card.create(ctx.request.body)
        ctx.body = JSON.stringify(newCard)
    }
    catch(e) {
        ctx.body = e.toString()
    }
})

const cardsPerPack = 5

router.post("/openpack", async (ctx) => {
    if (!ctx.user?.id) {ctx.body = "No user"; return ctx.status = 400}
    if (probArray.length <= 0) {return}
    
    const user = await User.findById(ctx.user?.id)
    if (!user?.packQuantity || user.packQuantity <= 0) {ctx.body = "User has no packs"; return ctx.status = 400}

    const cards = await getRandomCards(cardsPerPack)
    
    for (const card of cards) {
        const i = user.cards.findIndex((cardentry) => cardentry.card.toString() === card._id.toString())
        if (i < 0) {
            user.cards.push({card: card._id, quantity: 1})
        }
        else {
            user.cards[i].quantity += 1
        }
    }

    user.packQuantity -= 1
    
    await user.save()
    
    return ctx.body = JSON.stringify(cards)
})

router.get("/openpacksim", async (ctx)=>{
    ctx.body = JSON.stringify(await getRandomCards(cardsPerPack))
})

router.get("/cardcol", async (ctx)=>{
    if (!ctx.user.id) { return ctx.status = 400}

    const user = await User.findById(ctx.user?.id, {cards: 1, _id: 0}).populate("cards.card")
    return ctx.body = user
})

module.exports = router