const { Router } = require('express')

const adminRouter = require('./admin.routes')

const routes = Router()

routes.use('/admins', adminRouter)

module.exports = routes