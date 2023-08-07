const { hash } = require('bcryptjs')
const AppError = require('../utils/AppError')

const sqliteConnection = require('../database/sqlite')

class UserController {
    async create(request, response) {
        const { name, email, password, isAdmin } = request.body

        const database = await sqliteConnection()
        const checkUserExists = await database.get('SELECT * FROM users WHERE email = (?)', [email])

        if (checkUserExists) {
            throw new AppError('Email já cadastrado')
        }

        const hashedPassword = await hash(password, 8)

        await database.run(
            'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)', 
            [name, email, hashedPassword, isAdmin]
            )

        return response.status(201).json()
    }

    async update(request, response) {
        const { name, email } = request.body
        const { id } = request.params

        const database = await sqliteConnection()
        const user = await database.get('SELECT * FROM users WHERE id = (?)', [id])

        if (!user) {
            throw new AppError('Usuário não encontrado')
        }

        const userWithUpdatedEmail = await database.get('SELECT * FROM users WHERE email = (?)', [email])

        if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError('E-mail já cadastrado.')
        }

        user.name = name
        user.email = email

        await database.run(`
            UPDATE users SET
            name = ?,
            email = ?,
            updated_at = ?
            WHERE id = ?`,
            [user.name, user.email, new Date(), id]
            )

            return response.status(200).json()
    }
}

module.exports = UserController