const { hash, compare } = require('bcryptjs')
const AppError = require('../utils/AppError')
const knex = require('../database/knex')

class UserController {
    async create(request, response) {
        const { name, email, password, role } = request.body

        const checkUserExists = await knex('users').where({ email }).first()

        if (checkUserExists) {
            throw new AppError('Email já cadastrado')
        }

        const hashedPassword = await hash(password, 8)

        await knex('users').insert({
            name,
            email,
            password: hashedPassword,
            role
        })

        return response.status(201).json()
    }

    async update(request, response) {
        const { name, email, password, old_password, role } = request.body
        const user_id = request.user.id

        const user = await knex('users').where({ id: user_id }).first()

        if (!user) {
            throw new AppError('Usuário não encontrado')
        }

        const userWithUpdatedEmail = await knex('users').where({ email }).first()

        if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError('E-mail já cadastrado.')
        }

        user.name = name ?? user.name
        user.email = email ?? user.email
        user.role = role ?? user.role

        if (password && !old_password) {
            throw new AppError('Informar a senha antiga')
        }

        if (password && old_password) {
            const checkOldPassword = await compare(old_password, user.password)

            if(!checkOldPassword) {
                throw new AppError('A senha antiga não confere')
            }

            user.password = await hash(password, 8)
        }
 
        await knex('users').where({ id: user_id }).update({
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            updated_at: knex.fn.now()
        })
            return response.status(200).json()
    }
}

module.exports = UserController