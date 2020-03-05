import Ajv from 'ajv'
import ajverrors from 'ajv-errors'
import send from 'koa-send'
import Koa, { Middleware, ParameterizedContext } from 'koa'
import { getAbsoluteFSPath } from 'swagger-ui-dist'
import Table from 'cli-table'
import $RefParser from 'json-schema-ref-parser'
import chalk from 'chalk'
import path from 'path'
import * as _ from 'lodash'
import Debug from 'debug'
import { hbs } from './util'

const debug = Debug('openapi')

import {
  IOpenAPI,
  IOpenAPISchema,
  IOpenAPIRef,
  IOpenAPIParameter,
  Referenced,
  IOpenAPIParameterLocation,
  IOpenAPIOperation,
  IOpenAPIComponent,
  Dict,
  IOpenAPIRequestBody
} from './openapi'

import * as metaSchema from 'ajv/lib/refs/json-schema-draft-04.json'

let ajv: any = new Ajv({
  allErrors: true,
  schemaId: 'auto',
  jsonPointers: true
})

ajv.addMetaSchema(metaSchema)

ajverrors(ajv /*, {singleError: true} */)

export type ApiMethod =
  | 'get'
  | 'put'
  | 'post'
  | 'delete'
  | 'options'
  | 'head'
  | 'patch'
  | 'trace'

export class Api {
  path: string
  method: ApiMethod
  operation: IOpenAPIOperation
  schema: IOpenAPI
  schemaInited: boolean = false
  paramsSchema: Dict<IOpenAPISchema> = {}
  querySchema: Dict<IOpenAPISchema> = {}
  headerSchema: Dict<IOpenAPISchema> = {}
  cookieSchema: Dict<IOpenAPISchema> = {}
  payloadSchema: Dict<IOpenAPISchema> = {}

  constructor(
    schema: IOpenAPI,
    path: string,
    method: ApiMethod,
    option: IOpenAPIOperation
  ) {
    this.operation = option
    this.path = path
    this.method = method
    this.schema = schema
  }

  validate(data: any, schema: IOpenAPISchema | undefined, name: string): boolean {
    if (!schema) {
      return true
    }
    if (Object.keys(schema).length <= 0) {
      return true
    }
    schema = _.defaultsDeep({}, this.schema, schema)

    const validate = ajv.compile(schema)
    const b = validate(data)
    if (b !== true) {
      let errors = (validate.errors || []).map((item: any) => {
        return `${item.keyword}: ${item.message}`
      })
      throw new Error(`[${name}]${[ ...errors].join(';')}`)
    }
    return true
  }

  getParams(ctx: ParameterizedContext, at: IOpenAPIParameterLocation): any {
    if (at === 'query') {
      return ctx.query
    }
    if (at === 'cookie') {
      return new Proxy(
        {},
        {
          get(obj: {}, prop: string) {
            return ctx.cookies.get(prop)
          }
        }
      )
    }
    if (at === 'header') {
      return ctx.headers
    }
    if (at === 'path') {
      return ctx.params || {}
    }
  }

  addParamMetaSchema(
    params: IOpenAPIParameter,
    schema: IOpenAPISchema | undefined,
    root: IOpenAPISchema
  ): IOpenAPISchema {
    if (!schema) {
      return root
    }
    let name = params.name
    let required = params.required
    root.properties = root.properties || {}
    root.properties[name] = schema
    if (required) {
      root.required = root.required || []
      root.required.push(name)
    }
    return root
  }

  async getParamsSchema(at: IOpenAPIParameterLocation): Promise<Dict<IOpenAPISchema>> {
    const obj: Dict<IOpenAPISchema> = {}

    let parameters: Array<Referenced<IOpenAPIParameter>> = this.operation.parameters || []

    for (let param of parameters) {
      if (param !== Object(param)) {
        continue
      }
      let asParameter = param as IOpenAPIParameter
      let asRef = param as IOpenAPIRef
      if (asRef === Object(asRef) && asRef.hasOwnProperty('$ref')) {
        let root: { temp: any } & any = _.cloneDeep(this.schema)
        root.temp = asRef
        let schema: any = await $RefParser.dereference(root, {
          dereference: {
            circular: false
          }
        })
        if (schema.temp) {
          asParameter = schema.temp as IOpenAPIParameter
        }
      }

      if (asParameter.in !== at) {
        continue
      }

      obj.default = this.addParamMetaSchema(
        asParameter,
        asParameter.schema,
        obj.default || {}
      )

      let content = asParameter.content

      if (content) {
        Object.keys(content).forEach(key => {
          if (!content) {
            return
          }
          const item = content[key]
          obj[key] = this.addParamMetaSchema(asParameter, item, obj[key] || {})
        })
      }
    }
    return obj
  }

  async getPayloadSchema(): Promise<Dict<IOpenAPISchema>> {
    const obj: Dict<IOpenAPISchema> = {}
    const requestBody = this.operation.requestBody
    if (requestBody !== Object(requestBody)) {
      return obj
    }
    let asRef = requestBody as IOpenAPIRef
    let asRequestBody = requestBody as IOpenAPIRequestBody
    if (asRef.hasOwnProperty('$ref')) {
      let root: { temp: any } & any = _.cloneDeep(this.schema)
      root.temp = asRef
      let schema: any = await $RefParser.dereference(root, {
        dereference: {
          circular: false
        }
      })
      if (schema.temp) {
        asRequestBody = schema.temp as IOpenAPIRequestBody
      }
    }

    let content = asRequestBody.content

    if (content) {
      Object.keys(content).forEach(key => {
        if (!content) {
          return
        }
        const item = content[key]
        if (item && item.schema) {
          obj[key] = item.schema
        }
      })
    }
    return obj
  }

  getPayload(ctx: ParameterizedContext): any {
    let request = ctx.request as any
    if (request && request.body) {
      return request.body
    }
  }

  verify(
    paramMetaType: string = 'default',
    headerMetaType: string = 'default',
    cookieMetaType: string = 'default',
    queryMetaType: string = 'default'
  ): Middleware {
    const self = this
    return async function(
      ctx: ParameterizedContext,
      next?: () => Promise<any>
    ): Promise<void> {
      try {
        const pathParams = self.getParams(ctx, 'path')
        const getHeader = self.getParams(ctx, 'header')
        const getCookie = self.getParams(ctx, 'cookie')
        const getQuery = self.getParams(ctx, 'query')
        const getPayload = self.getPayload(ctx)
        if (!self.schemaInited) {
          ;[
            self.paramsSchema,
            self.headerSchema,
            self.cookieSchema,
            self.querySchema,
            self.payloadSchema
          ] = await Promise.all([
            self.getParamsSchema('path'),
            self.getParamsSchema('header'),
            self.getParamsSchema('cookie'),
            self.getParamsSchema('query'),
            // 获取请求 Content-Type 字段, 不包含参数, 如 "charset".
            self.getPayloadSchema()
          ])
          debug(self.paramsSchema, 'self.paramsSchema')
          debug(self.headerSchema, 'self.headerSchema')
          debug(self.cookieSchema, 'self.cookieSchema')
          debug(self.querySchema, 'self.querySchema')
          debug(self.payloadSchema, 'self.payloadSchema')
          self.schemaInited = true
        }
        self.validate(
          pathParams,
          self.paramsSchema[paramMetaType],
          'params validate error'
        )
        self.validate(
          getHeader,
          self.headerSchema[headerMetaType],
          'header validate error'
        )
        self.validate(
          getCookie,
          self.cookieSchema[cookieMetaType],
          'cookie validate error'
        )
        self.validate(getQuery, self.querySchema[queryMetaType], 'query validate error')
        self.validate(
          getPayload,
          self.payloadSchema[ctx.type] || self.payloadSchema.default,
          'payload validate error'
        )
      } catch (error) {
        throw error
      }
      try {
        if (next && _.isFunction(next)) {
          await next()
        }
      } catch (error) {
        throw error
      }
    }
  }
}

class OpenApi {
  apis: Api[]
  schema: IOpenAPI

  constructor(schema: IOpenAPI) {
    this.apis = []
    this.schema = schema
  }

  add(
    path: string,
    method: ApiMethod,
    option: IOpenAPIOperation,
    components?: IOpenAPIComponent
  ): Api {
    const existing = this.apis.find(item => {
      return item.path === path && item.method.toLowerCase() === method.toLowerCase()
    })
    if (existing) {
      const err = new Error(
        chalk.red(
          `path ${path} method ${method} is existing ${existing.operation.operationId}`
        )
      )
      console.error(err)
    }
    this.schema.components = _.defaultsDeep({}, this.schema.components, components)
    const api = new Api(this.schema, path, method, option)
    this.apis.push(api)
    this.schema.paths = this.schema.paths || {}
    this.schema.paths[path] = this.schema.paths[path] || {}
    this.schema.paths[path][method] = api.operation
    return api
  }

  static ui(
    config: IOpenAPI,
    json_path?: string,
    ui_path?: string,
    web_index_path?: string,
    web_static_path?: string
  ): Middleware {
    let option: IOpenAPI = {
      ...{
        openapi: '3.0.0',
        info: {
          title: 'openapi',
          version: '1.0.0'
        },
        paths: {}
      },
      ...config
    }

    let index_file: string = web_index_path || path.resolve(__dirname, 'index.hbs')
    let static_dir: string = web_static_path || getAbsoluteFSPath()

    return async function(ctx: any, next: () => Promise<any>) {
      let request_path = ctx.path
      if (json_path !== undefined && request_path === json_path) {
        ctx.body = option
      } else if (ui_path !== undefined) {
        let static_path = path.resolve(ui_path, 'static')
        let static_reg = new RegExp(`^${static_path}`)
        if (request_path === ui_path) {
          let obj = {
            doc_path: json_path,
            web_static_path: static_path
          }
          let tmp = await hbs(index_file, obj)
          ctx.body = tmp
        } else if (static_reg.test(request_path)) {
          let p = request_path.replace(static_reg, '')
          await send(ctx, p, { gzip: true, root: static_dir })
        }
      } else {
        await next()
      }
    }
  }

  print() {
    const table = new Table({
      head: ['operation', 'path', 'method']
    })
    this.apis.forEach(item => {
      table.push([chalk.green(item.operation.operationId), item.path, item.method])
    })
    console.log(``)
    console.log(`${chalk.red('apis: ')}`)
    console.log(table.toString())
  }
}

export default OpenApi
