/* eslint-disable comma-dangle */
import { Sequelize } from 'sequelize';
import allConfig from '../config/index.cjs';

import initUserAccountModel from './userAccount.model.mjs';

const env = process.env.NODE_ENV || 'development';
// this is the same as saying :
// const config = allConfig['development']
const config = allConfig[env];
const db = {};

// initiate a new instance of Sequelize
// note similarity to pool.query

const sequelize = new Sequelize(
  // database settings from config.js
  config.database,
  config.username,
  config.password,
  config
);

// here we are putting initItemModel from item.mjs into the object "db" (line 14)
db.UserAccount = initUserAccountModel(sequelize, Sequelize.DataTypes);

// // A    belongsTo     B
// db.Item.belongsTo(db.Category);
// // A      hasMany      B
// db.Category.hasMany(db.Item);

// here we are putting the instance we created in line 28 into the object "db"
db.sequelize = sequelize;
// db = {
//     Item: initItemModel(sequelize, Sequelize.DataTypes),
//    sequelize: sequelize
// }

export default db;
