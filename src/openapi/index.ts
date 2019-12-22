// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#definitions
export interface IOpenAPIExtensions {
  [xkey: string]: any
}

export interface IOpenAPI extends IOpenAPIExtensions {
  openapi: string
  info: IOpenAPIInfo
  servers?: Array<IOpenAPIServer>
  paths: IOpenAPIPath
  components?: IOpenAPIComponent
  security?: Array<IOpenAPISecurity>
  tags?: Array<IOpenAPITag>
  externalDocs?: IOpenAPIExternalDocs

}

export interface IOpenAPIInfo extends IOpenAPIExtensions {
  title: string
  description?: string
  termsOfService?: string
  version: string
  contact?: IOpenAPIContact
  license?: IOpenAPILicense
}

export interface IOpenAPIContact extends IOpenAPIExtensions {
  name?: string
  url?: string
  email?: string
}

export interface IOpenAPILicense extends IOpenAPIExtensions {
  name: string
  url?: string

}

export interface IOpenAPIServer extends IOpenAPIExtensions {
  url: string
  description?: string
  variables?: Dict<IOpenAPIServerVariable>

}

export interface IOpenAPIServerVariable extends IOpenAPIExtensions {
  enum?: Array<string>
  default: string
  description?: string
}

export interface IOpenAPIComponent extends IOpenAPIExtensions {
  schemas?: Dict<Referenced<IOpenAPISchema>>
  responses?: Dict<Referenced<IOpenAPIResponse>>
  parameters?: Dict<Referenced<IOpenAPIParameter>>
  examples?: Dict<Referenced<IOpenAPIExample>>
  requestBodies?: Dict<Referenced<IOpenAPIRequestBody>>
  headers?: Dict<Referenced<IOpenAPIHeader>>
  securitySchemes?: Dict<Referenced<IOpenAPISecurityScheme>>
  links?: Dict<Referenced<IOpenAPILink>>
  callbacks?: Dict<Referenced<IOpenAPICallback>>
}

export interface IOpenAPIPath extends IOpenAPIExtensions {
  [path: string]: IOpenAPIPathItem
}

export interface IOpenAPIPathItem extends IOpenAPIExtensions {
  $ref?: string
  summary?: string
  description?: string
  get?: IOpenAPIOperation
  put?: IOpenAPIOperation
  post?: IOpenAPIOperation
  delete?: IOpenAPIOperation
  options?: IOpenAPIOperation
  head?: IOpenAPIOperation
  patch?: IOpenAPIOperation
  trace?: IOpenAPIOperation
  servers?: Array<IOpenAPIServer>
  parameters?: Array<Referenced<IOpenAPIParameter>>
}

export interface IOpenAPIOperation extends IOpenAPIExtensions {
  tags?: Array<string>
  summary?: string
  description?: string
  externalDocs?: IOpenAPIExternalDocs
  operationId: string
  parameters?: Array<Referenced<IOpenAPIParameter>>
  requestBody?: Referenced<IOpenAPIRequestBody>
  responses: IOpenAPIResponses
  callbacks?: Dict<Referenced<IOpenAPICallback>>
  deprecated?: boolean
  security?: Array<IOpenAPISecurity>
  servers?: Array<IOpenAPIServer>
}

export interface IOpenAPIExternalDocs extends IOpenAPIExtensions {
  description?: string
  url: string
}

export type IOpenAPIParameterLocation = 'query' | 'header' | 'path' | 'cookie'
export type IOpenAPIParameterStyle =
  | 'matrix'
  | 'label'
  | 'form'
  | 'simple'
  | 'spaceDelimited'
  | 'pipeDelimited'
  | 'deepObject'

export interface IOpenAPIParameter extends IOpenAPIExtensions {
  name: string
  in: IOpenAPIParameterLocation
  description?: string
  required: boolean
  deprecated?: boolean
  allowEmptyValue?: boolean
  style?: IOpenAPIParameterStyle // Default values (based on value of in): for query - form; for path - simple; for header - simple; for cookie - form.
  explode?: boolean
  allowReserved?: boolean
  schema?: Referenced<IOpenAPISchema>
  example?: any
  examples?: Dict<Referenced<IOpenAPIExample>>
  content?: Dict<IOpenAPIMediaType>
}

export interface IOpenAPIRequestBody extends IOpenAPIExtensions {
  description?: string
  required?: boolean
  content: Dict<IOpenAPIMediaType>
}

export interface IOpenAPIMediaType extends IOpenAPIExtensions {
  schema?: Referenced<IOpenAPISchema>
  example?: any
  examples?: Dict<Referenced<IOpenAPIExample>>
  encoding?: Dict<IOpenAPIEncoding>
}

export interface IOpenAPIEncoding extends IOpenAPIExtensions {
  contentType?: string
  headers?: Dict<Referenced<IOpenAPIHeader>>
  style?: IOpenAPIParameterStyle
  explode?: boolean
  allowReserved?: boolean
}

export interface IOpenAPIResponses extends IOpenAPIExtensions {
  [code: string]: Referenced<IOpenAPIResponse>
}

export interface IOpenAPIResponse extends IOpenAPIExtensions {
  description?: string
  headers?: Dict<Referenced<IOpenAPIHeader>>
  content?: Dict<IOpenAPIMediaType>
  links?: Dict<Referenced<IOpenAPILink>>
}

export interface IOpenAPICallback extends IOpenAPIExtensions {
  [expression: string]: IOpenAPIPathItem
}

export interface IOpenAPIExample extends IOpenAPIExtensions {
  value?: any
  summary?: string
  description?: string
  externalValue?: string
}

export interface IOpenAPILink extends IOpenAPIExtensions {
  operationRef?: string
  operationId?: string
  parameters?: Dict<any | string>
  requestBody?: any | string
  description?: string
  server?: IOpenAPIServer
}

export interface IOpenAPIHeader extends Omit<IOpenAPIParameter, 'in' | 'name'>, IOpenAPIExtensions {

}

export interface IOpenAPITag extends IOpenAPIExtensions {
  name: string
  description?: string
  externalDocs?: IOpenAPIExternalDocs
}

export interface IOpenAPISchema extends IOpenAPIExtensions {
  nullable?: boolean
  discriminator?: IOpenAPIDiscriminator
  readOnly?: boolean
  writeOnly?: boolean
  xml?: IOpenAPIXML
  externalDocs?: IOpenAPIExternalDocs
  example?: any
  deprecated?: boolean

  title?: string
  multipleOf?: number
  maximum?: number
  exclusiveMaximum?: boolean
  minimum?: number
  exclusiveMinimum?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  maxItems?: number
  minItems?: number
  uniqueItems?: boolean
  maxProperties?: number
  minProperties?: number
  required?: Array<string>
  enum?: Array<any>

  $ref?: string
  id?: string

  type?: string
  anyOf?: Array<IOpenAPISchema>
  oneOf?: Array<IOpenAPISchema>
  allOf?: Array<IOpenAPISchema>
  not?: IOpenAPISchema
  items?: IOpenAPISchema
  properties?: Dict<IOpenAPISchema>
  additionalProperties?: boolean | IOpenAPISchema
  description?: string
  format?: string
  default?: any
}

export interface IOpenAPIDiscriminator extends IOpenAPIExtensions {
  propertyName: string
  mapping?: Dict<string>
}

export interface IOpenAPIXML extends IOpenAPIExtensions {
  name?: string
  namespace?: string
  prefix?: string
  attribute?: boolean
  wrapped?: boolean
}

export interface IOpenAPISecurityScheme extends IOpenAPIExtensions {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'
  description?: string
  name?: string
  in?: 'query' | 'header' | 'cookie'
  scheme?: string
  bearerFormat?: string
  flows?: IOpenAPIAuthFlow
  openIdConnectUrl?: string
}

export interface IOpenAPIAuthFlow extends IOpenAPIExtensions {
  implicit?: IOpenAPIAuthFlowItem
  password?: IOpenAPIAuthFlowItem
  clientCredentials?: IOpenAPIAuthFlowItem
  authorizationCode?: IOpenAPIAuthFlowItem
}

export interface IOpenAPIAuthFlowItem extends IOpenAPIExtensions {
  authorizationUrl?: string
  tokenUrl?: string
  refreshUrl?: string
  scopes: Dict<string>
}

export interface IOpenAPISecurity {
  [name: string]: Array<string>
}

export interface IOpenAPIRef {
  $ref: string
}

export type Referenced<T> = IOpenAPIRef | T

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type Dict<T> = {
  [key: string]: T;
}

export interface IOpenAPIContact {
  name?: string
  url?: string
  email?: string
}

export interface IOpenAPILicense {
  name: string
  url?: string
}
