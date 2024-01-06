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
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ajv_1 = __importDefault(require("ajv"));
var ajv_errors_1 = __importDefault(require("ajv-errors"));
var koa_send_1 = __importDefault(require("koa-send"));
var swagger_ui_dist_1 = require("swagger-ui-dist");
var cli_table_1 = __importDefault(require("cli-table"));
var json_schema_ref_parser_1 = __importDefault(require("json-schema-ref-parser"));
var chalk_1 = __importDefault(require("chalk"));
var path_1 = __importDefault(require("path"));
var _ = __importStar(require("lodash"));
var debug_1 = __importDefault(require("debug"));
var util_1 = require("./util");
var debug = debug_1.default('openapi');
var metaSchema = __importStar(require("ajv/lib/refs/json-schema-draft-04.json"));
var ajv = new ajv_1.default({
    allErrors: true,
    schemaId: 'auto',
    jsonPointers: true
});
ajv.addMetaSchema(metaSchema);
ajv_errors_1.default(ajv /*, {singleError: true} */);
var Api = /** @class */ (function () {
    function Api(schema, path, method, option) {
        this.schemaInited = false;
        this.paramsSchema = {};
        this.querySchema = {};
        this.headerSchema = {};
        this.cookieSchema = {};
        this.payloadSchema = {};
        this.operation = option;
        this.path = path;
        this.method = method;
        this.schema = schema;
    }
    Api.prototype.validate = function (data, schema, name) {
        if (!schema) {
            return true;
        }
        if (Object.keys(schema).length <= 0) {
            return true;
        }
        schema = _.defaultsDeep({}, this.schema, schema);
        var validate = ajv.compile(schema);
        var b = validate(data);
        if (b !== true) {
            var errors = (validate.errors || []).map(function (item) {
                return item.keyword + ": " + item.message;
            });
            throw new Error("[" + name + "]" + __spreadArrays(errors).join(';'));
        }
        return true;
    };
    Api.prototype.getParams = function (ctx, at) {
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
    Api.prototype.addParamMetaSchema = function (params, schema, root) {
        if (!schema) {
            return root;
        }
        var name = params.name;
        var required = params.required;
        root.properties = root.properties || {};
        root.properties[name] = schema;
        if (required) {
            root.required = root.required || [];
            root.required.push(name);
        }
        return root;
    };
    Api.prototype.getParamsSchema = function (at) {
        return __awaiter(this, void 0, void 0, function () {
            var obj, parameters, _loop_1, this_1, _i, parameters_1, param;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        obj = {};
                        parameters = this.operation.parameters || [];
                        _loop_1 = function (param) {
                            var asParameter, asRef, root, schema, content;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (param !== Object(param)) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        asParameter = param;
                                        asRef = param;
                                        if (!(asRef === Object(asRef) && asRef.hasOwnProperty('$ref'))) return [3 /*break*/, 2];
                                        root = _.cloneDeep(this_1.schema);
                                        root.temp = asRef;
                                        return [4 /*yield*/, json_schema_ref_parser_1.default.dereference(root, {
                                                dereference: {
                                                    circular: false
                                                }
                                            })];
                                    case 1:
                                        schema = _a.sent();
                                        if (schema.temp) {
                                            asParameter = schema.temp;
                                        }
                                        _a.label = 2;
                                    case 2:
                                        if (asParameter.in !== at) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        obj.default = this_1.addParamMetaSchema(asParameter, asParameter.schema, obj.default || {});
                                        content = asParameter.content;
                                        if (content) {
                                            Object.keys(content).forEach(function (key) {
                                                if (!content) {
                                                    return;
                                                }
                                                var item = content[key];
                                                obj[key] = _this.addParamMetaSchema(asParameter, item, obj[key] || {});
                                            });
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, parameters_1 = parameters;
                        _a.label = 1;
                    case 1:
                        if (!(_i < parameters_1.length)) return [3 /*break*/, 4];
                        param = parameters_1[_i];
                        return [5 /*yield**/, _loop_1(param)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, obj];
                }
            });
        });
    };
    Api.prototype.getPayloadSchema = function () {
        return __awaiter(this, void 0, void 0, function () {
            var obj, requestBody, asRef, asRequestBody, root, schema, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        obj = {};
                        requestBody = this.operation.requestBody;
                        if (requestBody !== Object(requestBody)) {
                            return [2 /*return*/, obj];
                        }
                        asRef = requestBody;
                        asRequestBody = requestBody;
                        if (!asRef.hasOwnProperty('$ref')) return [3 /*break*/, 2];
                        root = _.cloneDeep(this.schema);
                        root.temp = asRef;
                        return [4 /*yield*/, json_schema_ref_parser_1.default.dereference(root, {
                                dereference: {
                                    circular: false
                                }
                            })];
                    case 1:
                        schema = _a.sent();
                        if (schema.temp) {
                            asRequestBody = schema.temp;
                        }
                        _a.label = 2;
                    case 2:
                        content = asRequestBody.content;
                        if (content) {
                            Object.keys(content).forEach(function (key) {
                                if (!content) {
                                    return;
                                }
                                var item = content[key];
                                if (item && item.schema) {
                                    obj[key] = item.schema;
                                }
                            });
                        }
                        return [2 /*return*/, obj];
                }
            });
        });
    };
    Api.prototype.getPayload = function (ctx) {
        var request = ctx.request;
        if (request && request.body) {
            return request.body;
        }
    };
    Api.prototype.verify = function (paramMetaType, headerMetaType, cookieMetaType, queryMetaType) {
        if (paramMetaType === void 0) { paramMetaType = 'default'; }
        if (headerMetaType === void 0) { headerMetaType = 'default'; }
        if (cookieMetaType === void 0) { cookieMetaType = 'default'; }
        if (queryMetaType === void 0) { queryMetaType = 'default'; }
        var self = this;
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function () {
                var pathParams, getHeader, getCookie, getQuery, getPayload, error_1, error_2;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            pathParams = self.getParams(ctx, 'path');
                            getHeader = self.getParams(ctx, 'header');
                            getCookie = self.getParams(ctx, 'cookie');
                            getQuery = self.getParams(ctx, 'query');
                            getPayload = self.getPayload(ctx);
                            if (!!self.schemaInited) return [3 /*break*/, 2];
                            ;
                            return [4 /*yield*/, Promise.all([
                                    self.getParamsSchema('path'),
                                    self.getParamsSchema('header'),
                                    self.getParamsSchema('cookie'),
                                    self.getParamsSchema('query'),
                                    // 获取请求 Content-Type 字段, 不包含参数, 如 "charset".
                                    self.getPayloadSchema()
                                ])];
                        case 1:
                            _a = _b.sent(), self.paramsSchema = _a[0], self.headerSchema = _a[1], self.cookieSchema = _a[2], self.querySchema = _a[3], self.payloadSchema = _a[4];
                            debug(self.paramsSchema, 'self.paramsSchema');
                            debug(self.headerSchema, 'self.headerSchema');
                            debug(self.cookieSchema, 'self.cookieSchema');
                            debug(self.querySchema, 'self.querySchema');
                            debug(self.payloadSchema, 'self.payloadSchema');
                            self.schemaInited = true;
                            _b.label = 2;
                        case 2:
                            self.validate(pathParams, self.paramsSchema[paramMetaType], 'params validate error');
                            self.validate(getHeader, self.headerSchema[headerMetaType], 'header validate error');
                            self.validate(getCookie, self.cookieSchema[cookieMetaType], 'cookie validate error');
                            self.validate(getQuery, self.querySchema[queryMetaType], 'query validate error');
                            self.validate(getPayload, self.payloadSchema[ctx.type] || self.payloadSchema.default, 'payload validate error');
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _b.sent();
                            throw error_1;
                        case 4:
                            _b.trys.push([4, 7, , 8]);
                            if (!(next && _.isFunction(next))) return [3 /*break*/, 6];
                            return [4 /*yield*/, next()];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            error_2 = _b.sent();
                            throw error_2;
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
    };
    return Api;
}());
exports.Api = Api;
var OpenApi = /** @class */ (function () {
    function OpenApi(schema) {
        this.apis = [];
        this.schema = schema;
    }
    OpenApi.prototype.add = function (path, method, option, components) {
        var existing = this.apis.find(function (item) {
            return item.path === path && item.method.toLowerCase() === method.toLowerCase();
        });
        if (existing) {
            var err = new Error(chalk_1.default.red("path " + path + " method " + method + " is existing " + existing.operation.operationId));
            console.error(err);
        }
        this.schema.components = _.defaultsDeep({}, this.schema.components, components);
        var api = new Api(this.schema, path, method, option);
        this.apis.push(api);
        this.schema.paths = this.schema.paths || {};
        this.schema.paths[path] = this.schema.paths[path] || {};
        this.schema.paths[path][method] = api.operation;
        return api;
    };
    OpenApi.ui = function (config, json_path, ui_path, web_index_path, web_static_path) {
        var option = __assign({
            openapi: '3.0.0',
            info: {
                title: 'openapi',
                version: '1.0.0'
            },
            paths: {}
        }, config);
        var index_file = web_index_path || path_1.default.resolve(__dirname, 'index.hbs');
        var static_dir = web_static_path || swagger_ui_dist_1.getAbsoluteFSPath();
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function () {
                var request_path, static_path, static_reg, obj, tmp, p;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request_path = ctx.path;
                            if (!(json_path !== undefined && request_path === json_path)) return [3 /*break*/, 1];
                            ctx.body = option;
                            return [3 /*break*/, 8];
                        case 1:
                            if (!(ui_path !== undefined)) return [3 /*break*/, 6];
                            static_path = path_1.default.resolve(ui_path, 'static');
                            static_reg = new RegExp("^" + static_path);
                            if (!(request_path === ui_path)) return [3 /*break*/, 3];
                            obj = {
                                doc_path: json_path,
                                web_static_path: static_path
                            };
                            return [4 /*yield*/, util_1.hbs(index_file, obj)];
                        case 2:
                            tmp = _a.sent();
                            ctx.body = tmp;
                            return [3 /*break*/, 5];
                        case 3:
                            if (!static_reg.test(request_path)) return [3 /*break*/, 5];
                            p = request_path.replace(static_reg, '');
                            return [4 /*yield*/, koa_send_1.default(ctx, p, { gzip: true, root: static_dir })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [3 /*break*/, 8];
                        case 6: return [4 /*yield*/, next()];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
    };
    OpenApi.prototype.print = function () {
        var table = new cli_table_1.default({
            head: ['operation', 'path', 'method']
        });
        this.apis.forEach(function (item) {
            table.push([chalk_1.default.green(item.operation.operationId), item.path, item.method]);
        });
        console.log("");
        console.log("" + chalk_1.default.red('apis: '));
        console.log(table.toString());
    };
    return OpenApi;
}());
exports.default = OpenApi;
//# sourceMappingURL=swagger.js.map