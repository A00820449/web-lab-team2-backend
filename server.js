const Koa = require("koa")
const koaBody = require('koa-body')
const cors = require("kcors")
const Router = require("koa-router")
const userRouter = require("./routes/users")
const cardRouter = require("./routes/cards")
const morgan = require('koa-morgan')

const app = new Koa()
const router = new Router()

router.use("/users", userRouter.routes())
router.use("/users", userRouter.allowedMethods())

router.use("/cards", cardRouter.routes())
router.use("/cards", cardRouter.allowedMethods())

app.use(morgan("dev"))
app.use(koaBody())
app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())

module.exports = app