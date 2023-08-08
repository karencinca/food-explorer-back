const { Router } = require('express')

const userRouter = require('./user.routes')
const platesRouter = require('./plates.routes')

const routes = Router()

routes.use('/users', userRouter)
routes.use('/plates', platesRouter)

module.exports = routes