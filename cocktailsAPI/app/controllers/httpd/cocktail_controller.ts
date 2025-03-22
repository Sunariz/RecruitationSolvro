import { HttpContext } from '@adonisjs/core/http'
import mongoose from 'mongoose'

const { default: Cocktail } = await import('#models/cocktail')
const { default: Ingredient } = await import('#models/ingredient')
const { default: CocktailIngredient } = await import('#models/cocktail_ingredient')

export default class CocktailsController {
  /**
   * @swagger
   * /cocktails:
   *   get:
   *     summary: Get a list of cocktails
   *     tags: [Cocktails]
   *     parameters:
   *       - in: query
   *         name: ingredient
   *         schema:
   *           type: string
   *         description: Filter by ingredient ID
   *       - in: query
   *         name: isAlcoholic
   *         schema:
   *           type: boolean
   *         description: Filter by alcoholic content
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [name, category, date]
   *         description: Sort results by specified field
   *     responses:
   *       200:
   *         description: List of cocktails
   *       400:
   *         description: Invalid parameters
   *       404:
   *         description: No cocktails found
   */
  public async index({ request, response }: HttpContext) {
    try {
      // Retrieve query parameters from the request
      const { ingredient, isAlcoholic, sort } = request.qs()

      // Constructing the MongoDB query object
      let query: any = {}

      // Filtering by ingredient
      if (ingredient) {
        // Validate ingredient ID format
        if (!mongoose.Types.ObjectId.isValid(ingredient)) {
          return response.badRequest({ message: 'Invalid ingredient ID format' })
        }
        query._id = {
          $in: await CocktailIngredient.find({ ingredientId: ingredient }).distinct('cocktailId'),
        }
      }

      // Filtering by alcohol content
      if (isAlcoholic) {
        const isAlcohol = isAlcoholic === 'true'

        const cocktailIds = await CocktailIngredient.find({
          ingredientId: { $in: await Ingredient.find({ isAlcoholic: true }).distinct('_id') },
        }).distinct('cocktailId')

        if (isAlcohol) {
          query._id = { $in: cocktailIds }
        } else {
          query._id = { $nin: cocktailIds }
        }
      }

      // Retrieving cocktails query with potential filters
      let cocktailsQuery = Cocktail.find(query)

      // Sorting based on the provided query
      if (sort) {
        const sortOptions: any = {
          name: 'name',
          category: 'category',
          date: 'createdAt',
        }

        // If the provided sort value is invalid, return a 400 error
        if (!sortOptions[sort]) {
          return response.badRequest({
            message: 'Invalid sort parameter. Valid options are: name, category, date',
          })
        }

        cocktailsQuery = cocktailsQuery.sort({ [sortOptions[sort]]: 1 })
      }

      // Fetching the data from the database
      const cocktails = await cocktailsQuery

      // Handle case if no cocktails match the filters
      if (cocktails.length === 0) {
        return response.notFound({ message: 'No cocktails found matching the filters' })
      }

      // Return the list of cocktails
      return response.ok(cocktails)
    } catch (error) {
      return response.internalServerError({
        message: 'Error fetching cocktails',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /cocktails:
   *   post:
   *     summary: Create a new cocktail
   *     tags: [Cocktails]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, category, instructions]
   *             properties:
   *               name:
   *                 type: string
   *               category:
   *                 type: string
   *               instructions:
   *                 type: string
   *     responses:
   *       201:
   *         description: Cocktail created
   *       400:
   *         description: Missing required fields
   *       500:
   *         description: Error creating cocktail
   */
  public async store({ request, response }: HttpContext) {
    try {
      // Extract only the required fields from the request
      const data = request.only(['name', 'category', 'instructions'])

      // Check for required fields validation
      if (!data.name || !data.category || !data.instructions) {
        return response.badRequest({
          message: 'Missing required fields: name, category, instructions',
        })
      }

      // Create a new cocktail entry in the database
      const cocktail = await Cocktail.create(data)

      // Return the created cocktail with a 201 status (Created)
      return response.created(cocktail)
    } catch (error) {
      // Handle any server-side errors
      return response.internalServerError({
        message: 'Error creating cocktail',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /cocktails/{id}:
   *   get:
   *     summary: Get a cocktail by ID
   *     description: Fetches a single cocktail by its unique ID.
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the cocktail to retrieve.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully retrieved cocktail
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                   example: "Margarita"
   *                 category:
   *                   type: string
   *                   example: "Cocktail"
   *                 instructions:
   *                   type: string
   *                   example: "Mix ingredients and serve with a salted rim."
   *       400:
   *         description: Invalid ID format
   *       404:
   *         description: Cocktail not found
   *       500:
   *         description: Error fetching cocktail
   */
  public async show({ params, response }: HttpContext) {
    try {
      // Check if the ID format is valid
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.badRequest({ message: 'Invalid ID format' })
      }

      // Find the cocktail by ID
      const cocktail = await Cocktail.findById(params.id)

      // Handle case where the cocktail is not found
      if (!cocktail) {
        return response.notFound({ message: 'Cocktail not found' })
      }

      // Return the found cocktail
      return response.ok(cocktail)
    } catch (error) {
      // Handle any server-side errors
      return response.internalServerError({
        message: 'Error fetching cocktail',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /cocktails/{id}:
   *   put:
   *     summary: Update a cocktail by ID
   *     description: Updates the details of an existing cocktail using the provided ID.
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the cocktail to update.
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               category:
   *                 type: string
   *               instructions:
   *                 type: string
   *             example:
   *               name: "Margarita"
   *               category: "Cocktail"
   *               instructions: "Shake and serve in a chilled glass."
   *     responses:
   *       200:
   *         description: Successfully updated cocktail
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                   example: "Margarita"
   *                 category:
   *                   type: string
   *                   example: "Cocktail"
   *                 instructions:
   *                   type: string
   *                   example: "Shake and serve in a chilled glass."
   *       400:
   *         description: Invalid ID format
   *       404:
   *         description: Cocktail not found
   *       500:
   *         description: Error updating cocktail
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      // Check if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.badRequest({ message: 'Invalid ID format' })
      }

      // Attempt to update the cocktail with the given ID
      const cocktail = await Cocktail.findByIdAndUpdate(
        params.id,
        request.only(['name', 'category', 'instructions']),
        { new: true }
      )

      // If the cocktail with the given ID does not exist, return a 404 error
      if (!cocktail) {
        return response.notFound({ message: 'Cocktail not found' })
      }

      // Successfully updated the cocktail, return the updated data
      return response.ok(cocktail)
    } catch (error) {
      // Handle unexpected server errors
      return response.internalServerError({
        message: 'Error updating cocktail',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /cocktails/{id}:
   *   delete:
   *     summary: Delete a cocktail by ID with all its cocktail ingredients
   *     description: Deletes a cocktail using its unique ID. All cocktail ingredients connected to this cocktail ID are also deleted.
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the cocktail to delete.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully deleted cocktail and associated ingredients
   *       400:
   *         description: Invalid cocktail ID format
   *       404:
   *         description: Cocktail not found
   *       500:
   *         description: Internal server error while deleting cocktail
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      // Check if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.badRequest({ message: 'Invalid ID format' })
      }

      // Attempt to find and delete the cocktail
      const cocktail = await Cocktail.findByIdAndDelete(params.id)

      // If no cocktail was found, return a 404 error
      if (!cocktail) {
        return response.notFound({ message: 'Cocktail not found' })
      }

      // Delete all related CocktailIngredient records to avoid orphaned data
      await CocktailIngredient.deleteMany({ cocktailId: cocktail._id })

      // Successfully deleted the cocktail
      return response.ok({ message: 'Cocktail and its ingredients were deleted successfully' })
    } catch (error) {
      // Handle unexpected server errors
      return response.internalServerError({
        message: 'Error deleting cocktail',
        error: error.message,
      })
    }
  }
}
