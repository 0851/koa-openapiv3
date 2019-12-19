import Koa from 'koa'
import KoaRouter from 'koa-router'
import KoaBody from 'koa-body'
import OpenApi from 'koa-openapiv3'

let options = {
  port: 8080
}

let app: Koa = new Koa()
app.use(KoaBody())

const openapi = new OpenApi({
  openapi: '3.0.0',
  paths: {},
  info: {
    title: '',
    version: ''
  }
})

const router = new KoaRouter()

const test1 = openapi.add('/test1', 'get', {
  operationId: 'test1s',
  summary: 'this is test1',
  description: 'this is test1 xxx',
  parameters: [
    {
      name: 'uuid',
      in: 'cookie',
      schema: {
        type: 'string'
      },
      required: true
    },
    {
      name: 'ddd',
      in: 'query',
      schema: {
        type: 'string'
      },
      required: true
    },
    {
      name: 'test1',
      in: 'query',
      schema: {
        type: 'string'
      },
      required: true
    },
    {
      name: 'dsd',
      in: 'header',
      schema: {
        type: 'string'
      },
      required: true
    }
  ],
  responses: {}
})
router.get(test1.path, test1.verify(), async ctx => {
  ctx.body = 'success'
})
//
const test2 = openapi.add('/test2', 'post', {
  operationId: 'test12s',
  path: '/test2',
  method: 'POST',
  summary: 'test2',
  description: 'this is test2',
  deprecated: true,
  filename: __filename,
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            }
          },
          required: [ 'name' ]
        }
      }
    }
  },
  responses: {}
})

router.post(test2.path, test2.verify(), async ctx => {
  ctx.body = 'success'
})

app.use(router.routes()).use(router.allowedMethods())

app.use(OpenApi.ui(openapi.schema))

openapi.print()

console.log('serve', `listen on ${ options.port }`)

app.listen(options.port)
