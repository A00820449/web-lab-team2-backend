const Router = require("koa-router")
const jwt = require("jsonwebtoken")
const { User } = require("../db")

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

router.post("/auth", async (ctx, next)=>{
    /**
     * @type {string}
     */
    const username = ctx.request.body.username?.trim()
    /**
     * @type {string}
     */
    const password = ctx.request.body.password

    if (!username || !password) {
        ctx.status = 400
        ctx.body = {
            error: "Missing username or password",
            token: null
        }
        return
    }

    const user = await User.findOne({username: username})
    let pswdMatch = false
    if (user) {
        pswdMatch = await user.validatePassword(password)
    }
    if (!pswdMatch) {
        ctx.status = 400,
        ctx.body = {
            error: "Invalid username or password",
            token: null
        }
        return
    }

    const token = jwt.sign({
        id: user._id.toString(),
        username: user.username,
        isAdmin: user.isAdmin
    }, JWT_SECRET, {expiresIn: "7d"})

    ctx.status = 200
    ctx.body = {
        error: null,
        token: token,
        user: {
            id: user._id.toString(),
            name: user.name,
            username: user.username,
            isAdmin: user.isAdmin,
            lastFreePack: user.lastFreePack,
            packQuantity: user.packQuantity
        }
    }
})

router.get("/info", async (ctx)=>{
    const token = ctx.request.headers.authorization.match(/^Bearer (.+)$/)?.[1]
    if (!token) {
        ctx.status = 400
        ctx.body = {
            error: "Missing token",
            info: {}
        }
        return
    }
    const decoded = verifyAndDecodeJWT(token)
    if (!decoded) {
        ctx.status = 401
        ctx.body = {
            error: "Invalid token",
            info: {}
        }
        return
    }

    const user = await User.findOne({username: decoded.username}, {cards: 0})

    if (!user) {
        ctx.status = 404
        ctx.body = {
            error: "Invalid user",
            info: {}
        }
        return
    }

    ctx.status = 200
    ctx.body = {
        error: null,
        info: user
    }
})

router.post("/create", async (ctx, next)=>{
    /**
     * @type {string}
     */
    const username = ctx.request.body.username?.trim()
    /**
     * @type {string}
     */
    const name = ctx.request.body.name?.trim()
    /**
     * @type {string}
     */
    const password = ctx.request.body.password
    
    if (!username.match(/^[A-Za-z0-9_]{1,16}$/)) {
        ctx.body = {
            error: "Invalid username",
            user_id: null
        }
        ctx.status = 400
        return
    }

    if (!name) {
        ctx.body = {
            error: "Invalid name",
            user_id: null
        }
        ctx.status = 400
        return
    }

    if (!password.match(/^[a-zA-Z0-9!@#$%^&*]{8,32}$/)) {
        ctx.body = {
            error: "Invalid password",
            user_id: null
        }
        ctx.status = 401
        return
    }

    let newUser
    try {
        newUser = await User.create({username: username, name: name})
    } catch (e) {
        if (e.code === 11000) {
            ctx.status = 409
            ctx.body = {
                error: "Username already exists",
                user_id: null
            }
            return
        }
    }
    await newUser.setPassword(password)
    ctx.status = 200
    ctx.body = {
        error: null,
        user_id: newUser._id.toString()
    }
    return
})

module.exports = router