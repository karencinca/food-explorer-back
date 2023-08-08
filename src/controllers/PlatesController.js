const knex = require('../database/knex')

class PlatesController {
    async create(request, response) {
        const { title, description, price, ingredients } = request.body
        const { user_id } = request.params

        const [plate_id] = await knex('plates').insert({
            title,
            description,
            price,
            user_id
        })

        const ingredientsInsert = ingredients.map(name => {
            return {
                plate_id,
                name,
                user_id
            }
        })

        await knex('ingredients').insert(ingredientsInsert)

        response.json()
    }
}

module.exports = PlatesController