const knex = require('../database/knex')
const DiskStorage = require('../providers/DiskStorage')
const AppError = require('../utils/AppError')

class PlatesController {
    async create(request, response) {
        const { title, description, price, category, ingredients} = request.body
        const image = request.file.filename
        const user_id = request.user.id

        const diskStorage = new DiskStorage()
        const filename = await diskStorage.saveFile(image)

        const ingredientsArray = JSON.parse(ingredients || '[]')

        const [plate_id] = await knex('plates').insert({
            title, 
            description,
            price,
            image: filename,
            category,
            user_id
        })

        const ingredientsInsert = ingredientsArray.map(name => {
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
        const { id } = request.params
        const { title, description, category, price, ingredients } = request.body
        const imageFilename = request.file?.filename

        const plate = await knex('plates').where({ id }).first()

        if (!plate) {
            throw new AppError('Prato não encontrado', 404)
        }

        const plateUpdate = {
            title: title ?? plate.title,
            description: description ?? plate.description,
            category: category ?? plate.category,
            price: price ?? plate.price,
            updated_at: knex.fn.now()
        }

        if (imageFilename) {
            const diskStorage = new DiskStorage()

            if (plate.image) {
                await diskStorage.deleteFile(plate.image)
            }

            const filename = await diskStorage.saveFile(imageFilename)
            plateUpdate.image = filename
        }

        if (ingredients) {
            await knex('ingredients').where({ plate_id: id}).delete()

            const ingredientsInsert = ingredients.map((name) => {
                return {
                    plate_id: id,
                    name,
                }
            })

            await knex('ingredients').insert(ingredientsInsert)
        }
        await knex('plates').where({ id }).update(plateUpdate)
        return response.json()
    }

    async index(request, response) {
            const { searchQuery } = request.query
          
            let plates;
          
            if (searchQuery) {
              const keywords = searchQuery.split(' ').map(keyword => keyword.trim())
          
              plates = await knex('plates')
                .select([
                  'plates.id',
                  'plates.title',
                  'plates.description',
                  'plates.category',
                  'plates.price',
                  'plates.image',
                  'plates.user_id'
                ])
                .where(builder => {
                    builder.where(function() {
                      keywords.forEach(keyword => {
                        this.orWhere('title', 'like', `%${keyword}%`)
                        this.orWhere('ingredients.name', 'like', `%${keyword}%`)
                      })
                    })
                })
                .leftJoin('ingredients', 'plates.id', 'ingredients.plate_id')
                .groupBy('plates.id')
            } else {
              plates = await knex('plates')
                .select([
                  'plates.id',
                  'plates.title',
                  'plates.description',
                  'plates.category',
                  'plates.price',
                  'plates.image'
                ])
                .orderBy('title');
                
            }

            const platesWithIngredients = await Promise.all(
                plates.map(async (plate) => {
                  const plateIngredients = await knex('ingredients')
                    .where('plate_id', plate.id)
                    .select(['name']);
                  return {
                    ...plate,
                    ingredients: plateIngredients,
                  };
                })
              );

            return response.json(platesWithIngredients)  
    }
}

module.exports = PlatesController