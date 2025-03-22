/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

router.on('/').render('pages/home').as('home')

import router from '@adonisjs/core/services/router'

import fs from 'node:fs/promises'
import path from 'node:path'

router.get('/swagger', async () => {
  const swaggerFilePath = path.join(process.cwd(), 'docs', 'swagger.json')
  try {
    const fileContents = await fs.readFile(swaggerFilePath, 'utf-8')
    return fileContents
  } catch (error) {
    return { error: 'Cannot read file swagger.json', details: error.message }
  }
})

router.get('/docs', async () => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Swagger Docs</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.5.0/swagger-ui.min.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.5.0/swagger-ui-bundle.min.js"></script>
      <script>
        window.onload = () => {
          SwaggerUIBundle({
            url: '/swagger',
            dom_id: '#swagger-ui'
          });
        };
      </script>
    </body>
    </html>
  `
})

//const cocktailsController = () => import('#controllers/httpd/cocktail_controller')
const { default: CocktailsController } = await import('#controllers/httpd/cocktail_controller')
const cocktailsController = new CocktailsController()

const { default: IngredientsController } = await import('#controllers/httpd/ingredient_controller')
const ingredientsController = new IngredientsController()

const { default: CocktailIngredientsController } = await import(
  '#controllers/httpd/cocktail_ingredient_controller'
)
const cocktailIngredientsController = new CocktailIngredientsController()

router.get('/cocktails', cocktailsController.index)
router.post('/cocktails', cocktailsController.store)
router.get('/cocktails/:id', cocktailsController.show)
router.put('/cocktails/:id', cocktailsController.update)
router.delete('/cocktails/:id', cocktailsController.destroy)

router.get('/ingredients', ingredientsController.index)
router.post('/ingredients', ingredientsController.store)
router.get('/ingredients/:id', ingredientsController.show)
router.put('/ingredients/:id', ingredientsController.update)
router.delete('/ingredients/:id', ingredientsController.destroy)

router.get('/cocktail-ingredients', cocktailIngredientsController.index)
router.post('/cocktail-ingredients', cocktailIngredientsController.store)
router.get('/cocktail-ingredients/:id', cocktailIngredientsController.show)
router.put('/cocktail-ingredients/:id', cocktailIngredientsController.update)
router.delete('/cocktail-ingredients/:id', cocktailIngredientsController.destroy)
