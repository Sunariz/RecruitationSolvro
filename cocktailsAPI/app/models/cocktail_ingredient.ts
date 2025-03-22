import mongoose from 'mongoose'

/**
 * @swagger
 * components:
 *   schemas:
 *     CocktailIngredient:
 *       type: object
 *       required:
 *         - cocktailId
 *         - ingredientId
 *         - quantity
 *       properties:
 *         cocktailId:
 *           type: string
 *           description: The unique ID of the cocktail
 *           example: "60b7c7e3f4e8fa1b3c7a5391"
 *         ingredientId:
 *           type: string
 *           description: The unique ID of the ingredient
 *           example: "60b7c7e3f4e8fa1b3c7a5392"
 *         quantity:
 *           type: string
 *           description: The quantity of the ingredient in the cocktail (e.g., "2 oz")
 *           example: "2 oz"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the cocktail was created
 *           example: "2024-03-16T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the cocktail was last updated
 *           example: "2024-03-16T12:30:00.000Z"
 *       description: "CocktailIngredient (Model) linking a cocktail to its ingredients"
 */
const CocktailIngredientSchema = new mongoose.Schema(
  {
    cocktailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cocktail', required: true },
    ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    quantity: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.model('CocktailIngredient', CocktailIngredientSchema)
