const Router = require("koa-router")
const koaBody = require('koa-body')

const router = new Router()

router.get("/auth", (ctx, next)=>{
    ctx.body = ctx.request.query
})

router.post("/create", (ctx, next)=>{
    ctx.status = 200
    ctx.body = ctx.request.body
})

module.exports = router