"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ajv_1 = __importDefault(require("ajv"));
var ajv_errors_1 = __importDefault(require("ajv-errors"));
var koa_send_1 = __importDefault(require("koa-send"));
var cli_table_1 = __importDefault(require("cli-table"));
var json_schema_ref_parser_1 = __importDefault(require("json-schema-ref-parser"));
var chalk_1 = __importDefault(require("chalk"));
var ajv = new ajv_1.default({ allErrors: true, jsonPointers: true });
ajv_errors_1.default(ajv /*, {singleError: true} */);
var SwaggerApi = /** @class */ (function () {
    function SwaggerApi(option) {
        this.operation = __assign({}, option, {
            method: undefined,
            filename: undefined,
            path: undefined
        });
        this.path = option.path;
        this.filename = option.filename;
        this.method = option.method.toLowerCase();
    }
    SwaggerApi.prototype.validate = function (data, schema, name) {
        var validate = ajv.compile(schema);
        var b = validate(data);
        if (b !== true) {
            var errors = (validate.errors || []).map(function (item) {
                return {
                    name: name,
                    message: item.message
                };
            });
            throw errors;
        }
        return;
    };
    SwaggerApi.prototype.getParams = function (ctx, at) {
        if (at === 'query') {
            return ctx.query;
        }
        if (at === 'cookie') {
            return new Proxy({}, {
                get: function (obj, prop) {
                    return ctx.cookies.get(prop);
                }
            });
        }
        if (at === 'header') {
            return ctx.headers;
        }
        if (at === 'path') {
            return ctx.params || {};
        }
    };
    SwaggerApi.prototype.getParamsSchema = function (at) {
        return __awaiter(this, void 0, void 0, function () {
            var obj, parameters, _i, parameters_1, param, asRef, asParamter, item, schemaAsRef, schemaAsOpenAPISchema, schema, name, required, allowEmptyValue, example, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        obj = {
                            type: 'object',
                            properties: {},
                            required: []
                        };
                        parameters = this.operation.parameters || [];
                        _i = 0, parameters_1 = parameters;
                        _a.label = 1;
                    case 1:
                        if (!(_i < parameters_1.length)) return [3 /*break*/, 7];
                        param = parameters_1[_i];
                        asRef = param;
                        asParamter = param;
                        if (!(asRef['$ref'] !== '')) return [3 /*break*/, 3];
                        return [4 /*yield*/, json_schema_ref_parser_1.default.dereference(asRef)];
                    case 2:
                        item = _a.sent();
                        param = item;
                        _a.label = 3;
                    case 3:
                        if (asParamter['in'] !== at) {
                            return [3 /*break*/, 6];
                        }
                        schemaAsRef = asParamter['schema'] || {};
                        schemaAsOpenAPISchema = asParamter['schema'] || {};
                        schema = schemaAsOpenAPISchema || {};
                        name = asParamter['name'];
                        required = asParamter['required'];
                        allowEmptyValue = asParamter['allowEmptyValue'];
                        example = asParamter['example'];
                        if (!schemaAsRef['$ref']) return [3 /*break*/, 5];
                        return [4 /*yield*/, json_schema_ref_parser_1.default.dereference(schemaAsRef)];
                    case 4:
                        item = _a.sent();
                        schema = item;
                        _a.label = 5;
                    case 5:
                        schema.nullable = schema.nullable || allowEmptyValue;
                        schema.example = schema.example || example;
                        if (!obj.properties) {
                            obj.properties = {};
                        }
                        obj.properties[name] = schema;
                        if (!!required) {
                            if (!obj.required) {
                                obj.required = [];
                            }
                            obj.required.push(name);
                        }
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, obj];
                }
            });
        });
    };
    SwaggerApi.prototype.getPayloadSchema = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var requestBodyAsRef, requestBodyAsOpenAPIRequestBody, requestBody, content, contentType, schema, example;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = type.toLowerCase();
                        requestBodyAsRef = this.operation.requestBody || {};
                        requestBodyAsOpenAPIRequestBody = this.operation.requestBody || {};
                        requestBody = requestBodyAsOpenAPIRequestBody || {};
                        if (!requestBodyAsRef['$ref']) return [3 /*break*/, 2];
                        return [4 /*yield*/, json_schema_ref_parser_1.default.dereference(requestBodyAsRef)];
                    case 1:
                        requestBody = _a.sent();
                        _a.label = 2;
                    case 2:
                        content = requestBody['content'];
                        if (!content) {
                            return [2 /*return*/, {}];
                        }
                        contentType = content[type];
                        if (!contentType) {
                            return [2 /*return*/, {}];
                        }
                        schema = contentType['schema'] || {};
                        example = contentType['example'];
                        if (!schema['$ref']) return [3 /*break*/, 4];
                        return [4 /*yield*/, json_schema_ref_parser_1.default.dereference(schema)];
                    case 3:
                        schema = _a.sent();
                        _a.label = 4;
                    case 4:
                        schema.example = schema.example || example;
                        return [2 /*return*/, schema];
                }
            });
        });
    };
    SwaggerApi.prototype.getPayload = function (ctx) {
        return ctx.request.body;
    };
    SwaggerApi.prototype.do = function () {
        var self = this;
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function () {
                var pathParams, getQuery, getHeader, getCookie, getPayload, _a, pathParamsSchema, getQuerySchema, getHeaderSchema, getCookieSchema, getPayloadSchema, error_1, err;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            pathParams = self.getParams(ctx, 'path');
                            getQuery = self.getParams(ctx, 'query');
                            getHeader = self.getParams(ctx, 'header');
                            getCookie = self.getParams(ctx, 'cookie');
                            getPayload = self.getPayload(ctx);
                            return [4 /*yield*/, Promise.all([
                                    self.getParamsSchema('path'),
                                    self.getParamsSchema('query'),
                                    self.getParamsSchema('header'),
                                    self.getParamsSchema('cookie'),
                                    // 获取请求 Content-Type 字段, 不包含参数, 如 "charset".
                                    self.getPayloadSchema(ctx.type)
                                ])];
                        case 1:
                            _a = _b.sent(), pathParamsSchema = _a[0], getQuerySchema = _a[1], getHeaderSchema = _a[2], getCookieSchema = _a[3], getPayloadSchema = _a[4];
                            self.validate(pathParams, pathParamsSchema, 'Path error');
                            self.validate(getQuery, getQuerySchema, 'Query error');
                            self.validate(getPayload, getPayloadSchema, 'Payload error');
                            self.validate(getHeader, getHeaderSchema, 'Header error');
                            self.validate(getCookie, getCookieSchema, 'Cookie error');
                            return [4 /*yield*/, next()];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _b.sent();
                            ctx.status = 500;
                            err = error_1;
                            if (!Array.isArray(err)) {
                                err = [
                                    {
                                        name: 'Internal error',
                                        message: err.message
                                    }
                                ];
                            }
                            ctx.body = {
                                code: 500,
                                errors: err
                            };
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
    };
    return SwaggerApi;
}());
exports.SwaggerApi = SwaggerApi;
var Swagger = /** @class */ (function () {
    function Swagger() {
        this.swaggerApis = [];
    }
    Swagger.prototype.add = function (api) {
        var existing = this.swaggerApis.find(function (item) {
            return (item.path === api.path &&
                item.method.toLowerCase() === api.method.toLowerCase());
        });
        if (existing) {
            var err = new Error(chalk_1.default.red("path " + api.path + " method " + api.method + " is existing " + existing.filename));
            console.error(err);
        }
        var router = new SwaggerApi(api);
        this.swaggerApis.push(router);
        return router;
    };
    Swagger.prototype.extendPath = function (option) {
        var paths = (option.paths = option.paths || {});
        this.swaggerApis.forEach(function (item) {
            if (!paths[item.path]) {
                paths[item.path] = {};
            }
            var findPath = paths[item.path];
            if (findPath[item.method]) {
                findPath[item.method] = item.operation;
            }
            else {
                findPath[item.method] = item.operation;
            }
        });
        return option;
    };
    Swagger.prototype.ui = function (config) {
        var option = __assign({
            openapi: '3.0.0',
            info: {
                title: 'openapi',
                version: '1.0.0'
            },
            paths: {}
        }, config);
        option = this.extendPath(option);
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function () {
                var templ;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (ctx.path === config.routerPath) {
                                ctx.body = option;
                            }
                            if (!!config.uiRouterPath) return [3 /*break*/, 2];
                            return [4 /*yield*/, next()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            if (!(ctx.path === config.uiRouterPath)) return [3 /*break*/, 3];
                            templ = "\n        <!DOCTYPE html>\n          <html>\n            <head>\n              <title>" + option.info.title + " - " + option.info.version + "</title>\n              <meta charset=\"utf-8\"/>\n              <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n              <link href=\"https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700\" rel=\"stylesheet\">\n              <style>\n                body {\n                  margin: 0;\n                  padding: 0;\n                }\n              </style>\n            </head>\n            <body>\n              <redoc spec-url='" + config.routerPath + "'></redoc>\n              <script src=\"" + config.uiRouterPath + "__inner__js.js\"> </script>\n            </body>\n          </html>\n        ";
                            ctx.body = templ;
                            return [3 /*break*/, 7];
                        case 3:
                            if (!(ctx.path === config.uiRouterPath + "__inner__js.js")) return [3 /*break*/, 5];
                            return [4 /*yield*/, koa_send_1.default(ctx, 'redoc.standalone.js', { gzip: true, root: __dirname })];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 5: return [4 /*yield*/, next()];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
    };
    Swagger.prototype.printRoutes = function () {
        var table = new cli_table_1.default({
            head: ['Method', 'Path', 'Other']
        });
        this.swaggerApis.forEach(function (item) {
            table.push([item.method, item.path, item.filename]);
        });
        console.log(" App Routes :");
        console.log(table.toString());
    };
    return Swagger;
}());
exports.default = Swagger;
//# sourceMappingURL=swagger.js.map