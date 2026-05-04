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
    const { host, port, user, password, database } = config_json_1.default.database;
    // Create DB if not exists
    const connection = await promise_1.default.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
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
    // Sync tables
    await sequelize.sync({ alter: true });
    db.sequelize = sequelize;
}
exports.default = db;
