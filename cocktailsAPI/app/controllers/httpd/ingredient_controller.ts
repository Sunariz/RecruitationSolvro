import { HttpContext } from '@adonisjs/core/http'
import mongoose from 'mongoose'

const { default: Ingredient } = await import('#models/ingredient')
const { default: CocktailIngredient } = await import('#models/cocktail_ingredient')

export default class IngredientsController {
  /**
   * @swagger
   * /ingredients:
   *   get:
   *     summary: Get a list of ingredients
   *     tags: [Ingredients]
   *     responses:
   *       200:
   *         description: List of ingredients
   *       500:
   *         description: Error fetching ingredients
   */
  public async index({ response }: HttpContext) {
    try {
      // Retrieve all ingredients from the database
      const ingredients = await Ingredient.find()

      // Return the list of ingredients
      return response.ok(ingredients)
    } catch (error) {
      // Handle unexpected server errors
      return response.internalServerError({
        message: 'Error fetching ingredients',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /ingredients:
   *   post:
   *     summary: Create a new ingredient
   *     tags: [Ingredients]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, description, isAlcoholic, image]
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               isAlcoholic:
   *                 type: boolean
   *               image:
   *                 type: string
   *     responses:
   *       201:
   *         description: Ingredient created
   *       400:
   *         description: Missing required fields
   *       500:
   *         description: Error creating ingredient
   */
  public async store({ request, response }: HttpContext) {
    try {
      // Extract only the required fields from the request
      const data = request.only(['name', 'description', 'isAlcoholic', 'image'])

      // Check for required fields validation
      if (!data.name || !data.description || typeof data.isAlcoholic !== 'boolean' || !data.image) {
        return response.badRequest({
          message: 'Missing required fields: name, description, isAlcoholic, image',
        })
      }

      // Create a new ingredient entry in the database
      const ingredient = await Ingredient.create(data)

      // Return the created ingredient with a 201 status (Created)
      return response.created(ingredient)
    } catch (error) {
      // Handle any server-side errors
      return response.internalServerError({
        message: 'Error creating ingredient',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /ingredients/{id}:
   *   get:
   *     summary: Get an ingredient by ID
   *     tags: [Ingredients]
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the ingredient to retrieve.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully retrieved ingredient
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                   example: "Lime"
   *                 description:
   *                   type: string
   *                   example: "A citrus fruit used in cocktails."
   *                 isAlcoholic:
   *                   type: boolean
   *                   example: false
   *                 image:
   *                   type: string
   *                   example: "https://example.com/images/lime.png"
   *       400:
   *         description: Invalid ID format
   *       404:
   *         description: Ingredient not found
   *       500:
   *         description: Error fetching ingredient
   */
  public async show({ params, response }: HttpContext) {
    try {
      // Check if the ID format is valid
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.badRequest({ message: 'Invalid ID format' })
      }

      // Find the ingredient by ID
      const ingredient = await Ingredient.findById(params.id)

      // Handle case where the ingredient is not found
      if (!ingredient) {
        return response.notFound({ message: 'Ingredient not found' })
      }

      // Return the found ingredient
      return response.ok(ingredient)
    } catch (error) {
      // Handle any server-side errors
      return response.internalServerError({
        message: 'Error fetching ingredient',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /ingredients/{id}:
   *   put:
   *     summary: Update an ingredient by ID
   *     tags: [Ingredients]
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the ingredient to update.
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
   *               description:
   *                 type: string
   *               isAlcoholic:
   *                 type: boolean
   *               image:
   *                 type: string
   *             example:
   *               name: "Lime"
   *               description: "A citrus fruit used in cocktails."
   *               isAlcoholic: false
   *               image: "https://example.com/images/lime.png"
   *     responses:
   *       200:
   *         description: Successfully updated ingredient
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                 description:
   *                   type: string
   *                 isAlcoholic:
   *                   type: boolean
   *                 image:
   *                   type: string
   *       400:
   *         description: Invalid ID format
   *       404:
   *         description: Ingredient not found
   *       500:
   *         description: Error updating ingredient
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      // Check if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.badRequest({ message: 'Invalid ID format' })
      }

      // Attempt to update the cocktail with the given ID
      const ingredient = await Ingredient.findByIdAndUpdate(
        params.id,
        request.only(['name', 'description', 'isAlcoholic', 'image']),
        { new: true }
      )

      // If the ingredient with the given ID does not exist, return a 404 error
      if (!ingredient) {
        return response.notFound({ message: 'Ingredient not found' })
      }

      // Successfully updated the ingredient, return the updated data
      return response.ok(ingredient)
    } catch (error) {
      // Handle unexpected server errors
      return response.internalServerError({
        message: 'Error updating ingredient',
        error: error.message,
      })
    }
  }

  /**
   * @swagger
   * /ingredients/{id}:
   *   delete:
   *     summary: Delete an ingredient by ID with all its associated cocktail ingredients
   *     description: Deletes an ingredient using its unique ID. All cocktail ingredients associated with this ingredient ID are also deleted.
   *     tags: [Ingredients]
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the ingredient to delete.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully deleted ingredient and associated cocktail ingredients
   *       400:
   *         description: Invalid ingredient ID format
   *       404:
   *         description: Ingredient not found
   *       500:
   *         description: Internal server error while deleting ingredient
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      // Check if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.badRequest({ message: 'Invalid ID format' })
      }

      // Attempt to find and delete the cocktail
      const ingredient = await Ingredient.findByIdAndDelete(params.id)

      // If no ingredient was found, return a 404 error
      if (!ingredient) {
        return response.notFound({ message: 'Ingredient not found' })
      }

      // Delete all related CocktailIngredient records to avoid orphaned data
      await CocktailIngredient.deleteMany({ ingredientId: ingredient._id })

      // Successfully deleted the ingredient
      return response.ok({ message: 'Ingredient deleted successfully' })
    } catch (error) {
      // Handle unexpected server errors
      return response.internalServerError({
        message: 'Error deleting ingredient',
        error: error.message,
      })
    }
  }
}
