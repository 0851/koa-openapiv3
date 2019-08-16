import Koa from "koa";
import KoaRouter from "koa-router";
import KoaBody from "koa-body";
import Swagger from "../index";

let options = {
  port: 8080
};

let app: Koa = new Koa();
app.use(KoaBody());

const swagger = new Swagger();

const router = new KoaRouter();

const test1 = swagger.add({
  path: "/test1",
  method: "GET",
  filename: __filename,
  summary: "this is test1",
  description: "this is test1 xxx",
  parameters: [
    {
      name: "uuid",
      in: "cookie",
      schema: {
        type: "string"
      },
      required: true
    },
    {
      name: "ddd",
      in: "query",
      schema: {
        type: "string"
      },
      required: true
    },
    {
      name: "test1",
      in: "query",
      schema: {
        type: "string"
      },
      required: true
    },
    {
      name: "dsd",
      in: "header",
      schema: {
        type: "string"
      },
      required: true
    }
  ],
  responses: {}
});

router[test1.method](test1.path, test1.do(), async ctx => {
  ctx.body = "success";
});

const test2 = swagger.add({
  path: "/test2",
  method: "POST",
  summary: "test2",
  description: "this is test2",
  deprecated: true,
  filename: __filename,
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            name: {
              type: "string"
            }
          },
          required: ["name"]
        }
      }
    }
  },
  responses: {}
});

router[test2.method](test2.path, test2.do(), async ctx => {
  ctx.body = "success";
});

app.use(router.routes()).use(router.allowedMethods());

app.use(
  swagger.ui({
    routerPath: "/swagger.json",
    uiRouterPath: "/doc"
  })
);

swagger.printRoutes();

console.log("serve", `listen on ${options.port}`);

app.listen(options.port);
