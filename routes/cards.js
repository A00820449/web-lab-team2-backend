const Router = require("koa-router")
const jwt = require("jsonwebtoken")
const { Card } = require("../db")

const router = new Router()
const JWT_SECRET = process.env.JWT_SECRET || "secret"

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

router.post("/add", async (ctx, next)=> {
    if (!ctx.user?.isAdmin) {
        return;
    }
    try {
        const newCard = await Card.create(ctx.request.body)
        ctx.body = JSON.stringify(newCard)
    }
    catch(e) {
        ctx.body = e.toString()
    }
})

module.exports = router