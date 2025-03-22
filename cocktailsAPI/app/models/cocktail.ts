import mongoose from 'mongoose'

/**
 * @swagger
 * components:
 *   schemas:
 *     Cocktail:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - instructions
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the cocktail
 *           example: "Margarita"
 *         category:
 *           type: string
 *           description: The category of the cocktail (e.g., Cocktail, Mocktail, etc.)
 *           example: "Cocktail"
 *         instructions:
 *           type: string
 *           description: Instructions on how to prepare the cocktail
 *           example: "Mix ingredients and serve with a salted rim."
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
 *       description: "cocktail (Model)"
 */
const CocktailSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    instructions: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.model('Cocktail', CocktailSchema)
