"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var swagger_1 = __importDefault(require("./src/swagger"));
var schema_1 = __importDefault(require("./src/openapi/schema"));
exports.IOpenAPISchemaSchema = schema_1.default;
exports.default = swagger_1.default;
__export(require("./src/swagger"));
//# sourceMappingURL=index.js.map