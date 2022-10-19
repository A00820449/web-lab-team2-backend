const Router = require("koa-router")

const router = new Router()

router.get("/create", (ctx, next)=>{
    ctx.body = ctx.request.query
})

module.exports = router