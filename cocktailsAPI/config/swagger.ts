import path from 'node:path'

export default {
  path: path.join(process.cwd(), 'docs', 'swagger.yaml'),
  tagIndex: 2,
  info: {
    title: 'Cocktail Api',
    version: '1.0.0',
    description: 'Recruitment task for KN Solvro made by Alicja Bonar',
  },
  snakeCase: false,
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT', // if PUT/PATCH are provided for the same route, prefer PUT
  common: {
    parameters: {}, // OpenAPI conform parameters that are commonly used
    headers: {}, // OpenAPI conform headers that are commonly used
  },
  showFullPath: false,
}
