const { Router } = require('express')
const multer = require('multer')
const uploadConfig = require('../configs/upload')
const verifyUserAuthorization = require('../middlewares/verifyUserAuthorization')

const PlatesController = require('../controllers/PlatesController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const platesRoutes = Router()
const upload = multer(uploadConfig.MULTER)

const platesController = new PlatesController()

platesRoutes.use(ensureAuthenticated)

platesRoutes.get('/', platesController.index)
platesRoutes.post('/', verifyUserAuthorization("admin"), upload.single('image'), platesController.create)
platesRoutes.get('/:id', platesController.show)
platesRoutes.delete('/:id', verifyUserAuthorization("admin"), platesController.delete)
platesRoutes.patch('/:id', verifyUserAuthorization("admin"), upload.single('image'), platesController.update)

module.exports = platesRoutes