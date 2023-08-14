const knex = require('../database/knex')
const DiskStorage = require('../providers/DiskStorage')
const AppError = require('../utils/AppError')

class PlatesController {
    async create(request, response) {
        const { title, description, price, image, category, ingredients} = request.body
        const user_id = request.user.id

        const [plate_id] = await knex('plates').insert({
            title, 
            description,
            price,
            image,
            category,
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

        return response.json()

    }

    async show(request, response) {
        const { id } = request.params

        const plate = await knex('plates').where({ id }).first()
        const ingredients = await knex('ingredients').where({ plate_id: id }).orderBy('name')

        return response.json({
            ...plate,
            ingredients
        })
    }

    async delete(request, response) {
        const { id } = request.params

        await knex('plates').where({ id }).delete()

        return response.json()
    }

    async update(request, response) {
        const { plate_id } = request.params
        const imageFilename = request.file.filename

        const diskStorage = new DiskStorage()

        const plate = await knex('plates').where({ id: plate_id }).first()

        if (!plate) {
            throw new AppError('Prato não encontrado', 404)
        }

        if (plate.image) {
            await diskStorage.deleteFile(plate.image)
        }

        const filename = await diskStorage.saveFile(imageFilename)
        plate.image = filename

        await knex('plates').update(plate).where({ id: plate_id})

        return response.json(plate)
    }

    async index(request, response) {
        const { title, ingredients } = request.query
        const user_id = request.user.id

        let plates

        if (ingredients) {
            const filterIngredients = ingredients.split(',').map(ingredient => ingredient.trim())
            
            plates = await knex('ingredients')
            .select([
                'plates.id',
                'plates.title',
                'plates.user_id'
            ])
            .where('plates.user_id', user_id)
            .whereLike('plates.title', `%${title}%`)
            .whereIn('name', filterIngredients)
            .innerJoin('plates', 'plates.id', 'ingredients.plate_id')
            .orderBy('plates.title')

        } else {
            plates = await knex('plates')
            .where({ user_id })
            .whereLike('title', `%${title}%`)
            .orderBy('title')
        }

        const userIngredients = await knex('ingredients').where({ user_id })
        const platesWithIngredients = plates.map(plate => {
            const plateIngredients = userIngredients.filter(ingredient => ingredient.plate_id === plate.id)
            return {
                ...plate,
                ingredients: plateIngredients
            }
        })

        return response.json(platesWithIngredients)
    }
}

module.exports = PlatesController