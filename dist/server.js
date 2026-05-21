"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./_helpers/db");
const error_handler_1 = require("./_middleware/error-handler");
const swagger_1 = require("./_helpers/swagger");
const accounts_controller_1 = __importDefault(require("./accounts/accounts.controller"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
const allowedOrigins = [
    'http://localhost:4200',
    'https://bajejr-lab7.onrender.com',
    'https://itscardo05.github.io'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
(0, swagger_1.setupSwagger)(app);
app.use('/accounts', accounts_controller_1.default);
app.use(error_handler_1.errorHandler);
const PORT = process.env.PORT || 4000;
(0, db_1.initialize)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
})
    .catch(err => {
    console.error('Failed to initialize database', err);
});
