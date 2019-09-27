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
} from "./src/openapi.d";
import {
  SwaggerOption,
  SwaggerOptionUI,
  SwaggerApiOption
} from "./src/swagger";
import Koa, { Middleware } from "koa";
export {
  OpenAPISpec,
  OpenAPIOperation,
  OpenAPISchema,
  OpenAPIPaths,
  OpenAPIInfo,
  OpenAPIComponents,
  OpenAPISecurityRequirement,
  OpenAPITag,
  OpenAPIExternalDocumentation,
  OpenAPIParameterLocation,
  SwaggerOption,
  SwaggerOptionUI,
  SwaggerApiOption
};
export interface KoaBody {
  request: {
    body: any;
  };
}
export class SwaggerApi {
  path: string;
  method: string;
  filename: string;
  operation: OpenAPIOperation;
  constructor (option: SwaggerApiOption);
  validate (data: any, schema: OpenAPISchema, name: string): boolean;
  getParams (ctx: Koa.ParameterizedContext, at: OpenAPIParameterLocation): any;
  getParamsSchema (at: OpenAPIParameterLocation): Promise<OpenAPISchema>;
  getPayloadSchema (type: string): Promise<OpenAPISchema>;
  getPayload (ctx: Koa.ParameterizedContext<any, KoaBody>): any;
  do (): Koa.Middleware;
}
export default class Swagger {
  swaggerApis: SwaggerApi[];
  constructor ();
  add (api: SwaggerApiOption): SwaggerApi;
  extendPath (option: SwaggerOption): SwaggerOption;
  ui (config: SwaggerOptionUI): Middleware;
  printRoutes (): void;
}
