import Swagger from './src/swagger'

export default Swagger
export * from './src/openapi'
export * from './src/swagger'

declare module '*.json' {
  const value: any
  export default value
}
