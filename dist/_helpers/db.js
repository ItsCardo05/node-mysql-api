"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
const sequelize_1 = require("sequelize");
const promise_1 = __importDefault(require("mysql2/promise"));
const config_json_1 = __importDefault(require("../config.json"));
const account_model_1 = require("../accounts/account.model");
const refresh_token_model_1 = require("../accounts/refresh-token.model");
const db = {};
async function initialize() {
    // Use environment variables if they exist (on Render), otherwise fall back to config.json (locally)
    const host = process.env.DB_HOST || config_json_1.default.database.host;
    const port = Number(process.env.DB_PORT) || config_json_1.default.database.port;
    const user = process.env.DB_USER || config_json_1.default.database.user;
    const password = process.env.DB_PASSWORD || config_json_1.default.database.password;
    const database = process.env.DB_NAME || config_json_1.default.database.database;
    // Create DB if not exists 
    // Note: Hostinger usually doesn't allow creating databases via code, 
    // but keeping this block safe with a try/catch prevents it from crashing your app.
    try {
        const connection = await promise_1.default.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();
    }
    catch (err) {
        console.log("Database check/creation skipped or handled by host provider.");
    }
    // Connect with Sequelize
    const sequelize = new sequelize_1.Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        logging: false
    });
    // Init models
    db.Account = (0, account_model_1.accountModel)(sequelize);
    db.RefreshToken = (0, refresh_token_model_1.refreshTokenModel)(sequelize);
    // Relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);
    await sequelize.sync({ alter: true });
    db.sequelize = sequelize;
}
exports.default = db;
