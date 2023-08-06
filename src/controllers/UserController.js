const AppError = require('../utils/AppError')

class UserController {
    create(request, response) {
        const { name, email, password } = request.body

        if (!name) {
            throw new AppError('Informar nome')
        }

        response.status(201).json({ name, email, password })
    }
}

module.exports = UserController