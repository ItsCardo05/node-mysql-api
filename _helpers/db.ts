import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2/promise';
import config from '../config.json';
import { accountModel } from '../accounts/account.model';
import { refreshTokenModel } from '../accounts/refresh-token.model';

const db: any = {};

export async function initialize() {
  const { host, port, user, password, database } = config.database;

  // Create DB if not exists
  const connection = await mysql2.createConnection({ host, port, user, password });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await connection.end();

  // Connect with Sequelize
  const sequelize = new Sequelize(database, user, password, {
    host,
    port,
    dialect: 'mysql',
    logging: false
  });

  // Init models
  db.Account = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);

  // Relationships
  db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account);

  // Sync tables
  await sequelize.sync({ alter: true });

  db.sequelize = sequelize;
}

export default db;
