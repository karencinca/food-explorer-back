const { Router } = require('express')

const userRouter = require('./user.routes')
const platesRouter = require('./plates.routes')
const ingredientsRouter = require('./ingredients.routes')

const routes = Router()
routes.use('/users', userRouter)
routes.use('/plates', platesRouter)
routes.use('/ingredients', ingredientsRouter)

module.exports = routes