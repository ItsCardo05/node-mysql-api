"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function setupSwagger(app) {
    const swaggerPath = path_1.default.join(__dirname, '../swagger.yaml');
    if (fs_1.default.existsSync(swaggerPath)) {
        const swaggerDocument = js_yaml_1.default.load(fs_1.default.readFileSync(swaggerPath, 'utf8'));
        app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    }
}
