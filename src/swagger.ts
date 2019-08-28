import Ajv from "ajv";
import ajverrors from "ajv-errors";
import send from "koa-send";
import Koa from "koa";
import Table from "cli-table";
import $RefParser from "json-schema-ref-parser";
import chalk from "chalk";

import {
  OpenAPISpec,
  OpenAPIOperation,
  OpenAPISchema,
  OpenAPIPaths,
  OpenAPIInfo,
  OpenAPIComponents,
  OpenAPISecurityRequirement,
  OpenAPITag,
  OpenAPIExternalDocumentation,
  OpenAPIParameterLocation
} from "./openapi.d";

let ajv = new Ajv({ allErrors: true, jsonPointers: true });
ajverrors(ajv /*, {singleError: true} */);

interface KoaBody {
  request: {
    body: any;
  };
}
type SwaggerOption = OpenAPISpec;

type SwaggerOptionUI = {
  routerPath: string;
  uiRouterPath?: string;
  openapi?: string;
  info?: OpenAPIInfo;
  paths?: OpenAPIPaths;
  components?: OpenAPIComponents;
  security?: OpenAPISecurityRequirement[];
  tags?: OpenAPITag[];
  externalDocs?: OpenAPIExternalDocumentation;
};

type SwaggerApiOption = {
  path: string;
  method: string;
  filename: string;
  errorMessage?: any;
} & OpenAPIOperation;

class SwaggerApi {
  path: string;
  method: string;
  filename: string;
  operation: OpenAPIOperation;
  constructor(option: SwaggerApiOption) {
    this.operation = {
      ...option,
      ...{
        method: undefined,
        filename: undefined,
        path: undefined
      }
    };
    this.path = option.path;
    this.filename = option.filename;
    this.method = option.method.toLowerCase();
  }
  validate(data: any, schema: OpenAPISchema, name: string) {
    const validate = ajv.compile(schema);
    const b = validate(data);
    if (b !== true) {
      const errors = validate.errors.map(item => {
        return {
          name: name,
          message: item.message
        };
      });

      throw errors;
    }
    return;
  }
  getParams(ctx: Koa.ParameterizedContext, at: OpenAPIParameterLocation): any {
    if (at === "query") {
      return ctx.query;
    }
    if (at === "cookie") {
      return new Proxy(
        {},
        {
          get(obj: {}, prop: string) {
            return ctx.cookies.get(prop);
          }
        }
      );
    }
    if (at === "header") {
      return ctx.headers;
    }
    if (at === "path") {
      return ctx.params || {};
    }
  }
  async getParamsSchema(at: OpenAPIParameterLocation): Promise<OpenAPISchema> {
    const obj: OpenAPISchema = {
      type: "object",
      properties: {},
      required: []
    };
    let parameters = this.operation.parameters || [];
    for (let param of parameters) {
      if (param["$ref"]) {
        const item: any = await $RefParser.dereference(param as any);
        param = item;
      }
      if (param["in"] !== at) {
        continue;
      }

      let schema: OpenAPISchema = param["schema"] || {};
      let name = param["name"];
      let required = param["required"];
      let allowEmptyValue = param["allowEmptyValue"];
      let example = param["example"];

      if (schema["$ref"]) {
        const item: any = await $RefParser.dereference(schema as any);
        schema = item;
      }

      schema.nullable = schema.nullable || allowEmptyValue;
      schema.example = schema.example || example;
      obj.properties[name] = schema;

      if (!!required) {
        obj.required.push(name);
      }
    }
    return obj;
  }
  async getPayloadSchema(type: string): Promise<OpenAPISchema> {
    type = type.toLowerCase();
    let requestBody = this.operation.requestBody || {};
    if (requestBody["$ref"]) {
      requestBody = await $RefParser.dereference(requestBody);
    }

    let content = requestBody["content"];
    if (!content) {
      return {};
    }

    let contentType = content[type];
    if (!contentType) {
      return {};
    }

    let schema = contentType["schema"] || {};
    let example = contentType["example"];
    if (schema["$ref"]) {
      schema = await $RefParser.dereference(schema);
    }
    schema.example = schema.example || example;

    return schema;
  }

  getPayload(ctx: Koa.ParameterizedContext<any, KoaBody>): any {
    return ctx.request.body;
  }

  do(): Koa.Middleware {
    const self = this;
    return async function(
      ctx: Koa.ParameterizedContext<any, KoaBody>,
      next: () => Promise<any>
    ) {
      try {
        const pathParams = self.getParams(ctx, "path");
        const getQuery = self.getParams(ctx, "query");
        const getHeader = self.getParams(ctx, "header");
        const getCookie = self.getParams(ctx, "cookie");
        const getPayload = self.getPayload(ctx);

        const [
          pathParamsSchema,
          getQuerySchema,
          getHeaderSchema,
          getCookieSchema,
          getPayloadSchema
        ] = await Promise.all([
          self.getParamsSchema("path"),
          self.getParamsSchema("query"),
          self.getParamsSchema("header"),
          self.getParamsSchema("cookie"),
          // 获取请求 Content-Type 字段, 不包含参数, 如 "charset".
          self.getPayloadSchema(ctx.type)
        ]);

        self.validate(pathParams, pathParamsSchema, "Path error");
        self.validate(getQuery, getQuerySchema, "Query error");
        self.validate(getPayload, getPayloadSchema, "Payload error");
        self.validate(getHeader, getHeaderSchema, "Header error");
        self.validate(getCookie, getCookieSchema, "Cookie error");

        await next();
      } catch (error) {
        ctx.status = 500;
        let err = error;
        if (!Array.isArray(err)) {
          err = [
            {
              name: "Internal error",
              message: err.message
            }
          ];
        }
        ctx.body = {
          code: 500,
          errors: err
        };
      }
    };
  }
}

class Swagger {
  swaggerApis: SwaggerApi[];
  constructor() {
    this.swaggerApis = [];
  }
  add(api: SwaggerApiOption): SwaggerApi {
    const existing = this.swaggerApis.find(item => {
      return (
        item.path === api.path &&
        item.method.toLowerCase() === api.method.toLowerCase()
      );
    });

    if (existing) {
      const err = new Error(
        chalk.red(
          `path ${api.path} method ${api.method} is existing ${existing.filename}`
        )
      );
      console.error(err);
    }

    const router = new SwaggerApi(api);
    this.swaggerApis.push(router);
    return router;
  }
  extendPath(option: SwaggerOption): SwaggerOption {
    const paths = (option.paths = option.paths || {});
    this.swaggerApis.forEach(item => {
      if (!paths[item.path]) {
        paths[item.path] = {};
      }
      const findPath = paths[item.path];
      if (findPath[item.method]) {
        findPath[item.method] = item.operation;
      } else {
        findPath[item.method] = item.operation;
      }
    });
    return option;
  }

  ui(config: SwaggerOptionUI): Koa.Middleware {
    let option: SwaggerOption = {
      ...{
        openapi: "3.0.0",
        info: {
          title: "openapi",
          version: "1.0.0"
        },
        paths: {}
      },
      ...config
    };

    option = this.extendPath(option);

    return async function(
      ctx: Koa.ParameterizedContext,
      next: () => Promise<any>
    ) {
      if (ctx.path === config.routerPath) {
        ctx.body = option;
      }
      if (!config.uiRouterPath) {
        await next();
      }
      if (ctx.path === config.uiRouterPath) {
        const templ = `
        <!DOCTYPE html>
          <html>
            <head>
              <title>${option.info.title} - ${option.info.version}</title>
              <meta charset="utf-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                }
              </style>
            </head>
            <body>
              <redoc spec-url='${config.routerPath}'></redoc>
              <script src="${config.uiRouterPath}__inner__js.js"> </script>
            </body>
          </html>
        `;
        ctx.body = templ;
      } else if (ctx.path === `${config.uiRouterPath}__inner__js.js`) {
        await send(ctx, "redoc.standalone.js", { gzip: true, root: __dirname });
      } else {
        await next();
      }
    };
  }

  printRoutes() {
    const table = new Table({
      head: ["Method", "Path", "Where The File"]
    });

    this.swaggerApis.forEach(item => {
      table.push([item.method, item.path, item.filename]);
    });

    console.log(` App Routes :`);
    console.log(table.toString());
  }
}
export { SwaggerOption, SwaggerOptionUI, SwaggerApiOption, SwaggerApi };
export default Swagger;
