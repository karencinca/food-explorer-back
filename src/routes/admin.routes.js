const { Router } = require('express')

const AdminController = require('../controllers/AdminController')

const adminRoutes = Router()


const adminController = new AdminController()

adminRoutes.post('/', adminController.create)

module.exports = adminRoutes