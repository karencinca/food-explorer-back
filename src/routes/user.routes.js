const { Router } = require('express')

const UserController = require('../controllers/UserController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')
const UserValidatedController = require('../controllers/UserValidatedController')

const userRoutes = Router()

const userController = new UserController()
const userValidatedController = new UserValidatedController()

userRoutes.post('/', userController.create)
userRoutes.put('/', ensureAuthenticated, userController.update)
userRoutes.get('/validated', ensureAuthenticated, userValidatedController.index)

module.exports = userRoutes