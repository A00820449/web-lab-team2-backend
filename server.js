const Koa = require("koa")
const koaBody = require('koa-body')
const cors = require("kcors")
const Router = require("koa-router")
const userRouter = require("./routes/users")

const app = new Koa()
const router = new Router()

router.use("/users", userRouter.routes())
router.use("/users", userRouter.allowedMethods())

app.use(koaBody())
app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())

module.exports = app