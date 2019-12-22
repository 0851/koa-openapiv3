import Swagger from './src/swagger'
import IOpenAPISchemaSchema from './src/openapi/schema'

export { IOpenAPISchemaSchema }
export default Swagger
export * from './src/openapi'
export * from './src/swagger'

declare module '*.json' {
  const value: any
  export default value
}
