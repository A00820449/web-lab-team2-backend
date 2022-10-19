const Koa = require("koa")
const Router = require("koa-router")
const userRouter = require("./routes/users")

const app = new Koa()
const router = new Router()

router.use("/users", userRouter.routes(), userRouter.allowedMethods())
app.use(router.routes())

module.exports = app