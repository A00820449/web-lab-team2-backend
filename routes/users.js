const Router = require("koa-router")
const { User } = require("../db")

const router = new Router()

router.get("/auth", async (ctx, next)=>{
    /**
     * @type {string}
     */
    const username = ctx.request.query.username.trim()
    /**
     * @type {string}
     */
    const password = ctx.request.query.password

    if (!username || !password) {
        ctx.status = 400
        ctx.body = {
            error: "Invalid request",
            valid: false
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
            valid: false
        }
        return
    }

    ctx.status = 200
    ctx.body = {
        error: null,
        valid: true
    }
})

router.post("/create", async (ctx, next)=>{
    /**
     * @type {string}
     */
    const username = ctx.request.body.username.trim()
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

    if (!password.match(/^[a-zA-Z0-9!@#$%^&*]{8,32}$/)) {
        ctx.body = {
            error: "Invalid password",
            user_id: null
        }
        ctx.status = 400
        return
    }

    let newUser
    try {
        newUser = await User.create({username: username})
    } catch (e) {
        console.error(e)
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