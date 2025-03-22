import { HttpContext } from '@adonisjs/core/http'
import mongoose from 'mongoose'

const { default: CocktailIngredient } = await import('#models/cocktail_ingredient')
const { default: Cocktail } = await import('#models/cocktail')
const { default: Ingredient } = await import('#models/ingredient')

export default class CocktailIngredientsController {
  /**
   * @swagger
   * /cocktail-ingredients:
   *   get:
   *     summary: Get a list of cocktail ingredients with optional filters
   *     description: Fetches cocktail ingredients based on optional filters for cocktail ID or ingredient ID. If no filters are provided, all cocktail ingredients will be returned.
   *     tags: [CocktailIngredients]
   *     parameters:
   *       - in: query
   *         name: cocktailId
   *         description: The ID of the cocktail to filter by
   *         required: false
   *         schema:
   *           type: string
   *       - in: query
   *         name: ingredientId
   *         description: The ID of the ingredient to filter by
   *         required: false
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of cocktail ingredients
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CocktailIngredient'
   *       400:
   *         description: Invalid ID format
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: 'Invalid cocktail ID format'
   *       404:
   *         description: No cocktail ingredients found matching the filters
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: 'No cocktail ingredients found matching the filters'
   *       500:
   *         description: Internal server error when fetching cocktail ingredients
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: 'Error fetching cocktail ingredients'
   *                 error:
   *                   type: string
   *                   example: 'Server error message'
   */
  public async index({ request, response }: HttpContext) {
    try {
      // Retrieve query parameters from the request
      const { cocktailId, ingredientId } = request.qs()

      // Constructing the MongoDB query object
      let query: any = {}

      // Filtering by cocktail
      if (cocktailId) {
        // Validate cocktail ID format
        if (!mongoose.Types.ObjectId.isValid(cocktailId)) {
          return response.badRequest({ message: 'Invalid cocktail ID format' })
        }
        query._id = {
          $in: await CocktailIngredient.find({ cocktailId: cocktailId }),
        }
      }

      // Filtering by ingredient
      if (ingredientId) {
        // Validate cocktail ID format
        if (!mongoose.Types.ObjectId.isValid(ingredientId)) {
          return response.badRequest({ message: 'Invalid ingredient ID format' })
        }
        query._id = {
          $in: await CocktailIngredient.find({ ingredientId: ingredientId }),
        }
      }

      // Retrieving cocktail ingredients query with potential filters
      let cocktailIngredientsQuery =
        CocktailIngredient.find(query).populate('cocktailId ingredientId')

      // Fetching the data from the database
      const cocktailingredients = await cocktailIngredientsQuery

      // Handle case if no cocktails match the filters
      if (cocktailingredients.length === 0) {
        return response.notFound({ message: 'No cocktail ingredients found matching the filters' })
      }

      // Return the list of cocktails
      return response.ok(cocktailingredients)
    } catch (error) {
      // Handle unexpected server errors
      return response.internalServerError({
        message: 'Error fetching cocktail ingredients',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /cocktail-ingredients:
   *   post:
   *     summary: Create a new cocktail ingredient
   *     tags: [CocktailIngredients]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CocktailIngredient'
   *     responses:
   *       201:
   *         description: Cocktail ingredient created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CocktailIngredient'
   *       400:
   *         description: Missing required fields or invalid cocktail/ingredient IDs
   *       404:
   *         description: Cocktail, Ingredient or CocktailIngredient not found in database
   *       500:
   *         description: Error creating cocktail ingredient
   */
  public async store({ request, response }: HttpContext) {
    try {
      // Extract only the required fields from the request
      const data = request.only(['cocktailId', 'ingredientId', 'quantity'])

      // Check for required fields validation
      if (!data.cocktailId || !data.ingredientId || !data.quantity) {
        return response.badRequest({
          message: 'Missing required fields: cocktailId, ingredientId, quantity',
        })
      }

      if (!mongoose.Types.ObjectId.isValid(data.cocktailId)) {
        return response.badRequest({ message: 'Invalid cocktail ID format' })
      }

      if (!mongoose.Types.ObjectId.isValid(data.ingredientId)) {
        return response.badRequest({ message: 'Invalid ingredient ID format' })
      }

      // Check if the cocktail exists in the database
      const cocktailExists = await Cocktail.findById(data.cocktailId)
      if (!cocktailExists) {
        return response.notFound({ message: 'Cocktail not found in database' })
      }

      // Check if the ingredient exists in the database
      const ingredientExists = await Ingredient.findById(data.ingredientId)
      if (!ingredientExists) {
        return response.notFound({ message: 'Ingredient not found in database' })
      }

      // Create a new cocktail ingredient entry in the database
      const cocktailIngredient = await CocktailIngredient.create(data)

      // Return the created cocktail ingredient with a 201 status (Created)
      return response.created(cocktailIngredient)
    } catch (error) {
      // Handle any server-side errors
      return response.internalServerError({
        message: 'Error creating cocktail ingredient',
      })
    }
  }

  /**
   * @swagger
   * /cocktail-ingredients/{id}:
   *   get:
   *     summary: Get a cocktail ingredient by ID
   *     tags: [CocktailIngredients]
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the cocktail ingredient
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully retrieved cocktail ingredient
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CocktailIngredient'
   *       400:
   *         description: Invalid ID format
   *       404:
   *         description: Cocktail ingredient not found
   *       500:
   *         description: Error fetching cocktail ingredient
   */
  public async show({ params, response }: HttpContext) {
    try {
      // Check if the ID format is valid
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.badRequest({ message: 'Invalid ID format' })
      }

      // Find the cocktail ingredient by ID
      const cocktailIngredient = await CocktailIngredient.findById(params.id).populate(
        'cocktailId ingredientId'
      )

      // Handle case where the cocktail ingredient is not found
      if (!cocktailIngredient) {
        return response.notFound({ message: 'Cocktail ingredient not found' })
      }

      // Return the found cocktail ingredient
      return response.ok(cocktailIngredient)
    } catch (error) {
      // Handle any server-side errors
      return response.internalServerError({
        message: 'Error fetching cocktail ingredient',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /cocktail-ingredients/{id}:
   *   put:
   *     summary: Update a cocktail ingredient by ID
   *     tags: [CocktailIngredients]
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the cocktail ingredient to update
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CocktailIngredient'
   *     responses:
   *       200:
   *         description: Successfully updated cocktail ingredient
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CocktailIngredient'
   *       400:
   *         description: Invalid ID format
   *       404:
   *         description: Cocktail ingredient not found
   *       500:
   *         description: Error updating cocktail ingredient
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      // Check if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.badRequest({ message: 'Invalid ID format' })
      }

      // Attempt to update the cocktail ingredient with the given ID
      const cocktailIngredient = await CocktailIngredient.findByIdAndUpdate(
        params.id,
        request.only(['cocktailId', 'ingredientId', 'quantity']),
        { new: true }
      )

      // If the cocktail ingredient with the given ID does not exist, return a 404 error
      if (!cocktailIngredient) {
        return response.notFound({ message: 'Cocktail ingredient not found' })
      }

      // Successfully updated the cocktail ingredient, return the updated data
      return response.ok(cocktailIngredient)
    } catch (error) {
      // Handle unexpected server errors
      return response.internalServerError({
        message: 'Error updating cocktail ingredient',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /cocktail-ingredients/{id}:
   *   delete:
   *     summary: Delete a cocktail ingredient by ID
   *     tags: [CocktailIngredients]
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the cocktail ingredient to delete
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully deleted cocktail ingredient
   *       400:
   *         description: Invalid ID format
   *       404:
   *         description: Cocktail ingredient not found
   *       500:
   *         description: Error deleting cocktail ingredient
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      // Check if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.badRequest({ message: 'Invalid ID format' })
      }

      // Attempt to find and delete the cocktail ingredient
      const cocktailIngredient = await CocktailIngredient.findByIdAndDelete(params.id)

      // If no cocktail ingredient was found, return a 404 error
      if (!cocktailIngredient) {
        return response.notFound({ message: 'Cocktail ingredient not found' })
      }

      // Successfully deleted the cocktail ingredient
      return response.ok({ message: 'Cocktail ingredient deleted successfully' })
    } catch (error) {
      // Handle unexpected server errors
      return response.internalServerError({
        message: 'Error deleting cocktail ingredient',
        error: error.message,
      })
    }
  }
}
