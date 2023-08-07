const { Router } = require('express')

const UserController = require('../controllers/UserController')

const userRoutes = Router()

const userController = new UserController()

userRoutes.post('/', userController.create)
userRoutes.put('/:id', userController.update)

module.exports = userRoutes