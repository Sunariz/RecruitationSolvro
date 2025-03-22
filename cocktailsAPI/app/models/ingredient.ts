import mongoose from 'mongoose'

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       required:
 *         - name
 *         - isAlcoholic
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the ingredient
 *           example: "Lime"
 *         description:
 *           type: string
 *           description: A brief description of the ingredient
 *           example: "A sour fruit used in cocktails"
 *         isAlcoholic:
 *           type: boolean
 *           description: Whether the ingredient contains alcohol
 *           example: false
 *         image:
 *           type: string
 *           description: URL to an image of the ingredient
 *           example: "https://example.com/images/lime.jpg"
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
 *       description: "Ingredient (Model)"
 */
const IngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    isAlcoholic: { type: Boolean, required: true },
    image: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model('Ingredient', IngredientSchema)
