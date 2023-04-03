const  { Sequelize, DataTypes: DataType} = require('sequelize');
const pg = require('pg')
const Part = require('./models/part');
const Order = require('./models/Orders');
const Reviews = require('./models/Reviews');
const Settings = require('./models/Settings');
const User = require('./models/User');
const TreeTranslate = require('./models/TreeTranslate');

const models = [Part, Order, Reviews, Settings, User, TreeTranslate];

let db = {};
// Create a new instance of Sequelize

async function initialize() {
  if (Object.keys(db).length === 0) {
    const sequelize = new Sequelize(
    {
      database: "root",
      username: "root",
      password: "autoParts123!",
      host: '127.0.0.1',
      dialect: 'postgres',
      protocol: 'postgres',
    });
  
    // Initialize models
    models.forEach((model) => {
        const seqModel = model(sequelize)
        db[seqModel.name] = seqModel
    });
  
    // Apply associations
    Object.keys(db).forEach(key => {
      if ('associate' in db[key]) {
        db[key].associate(db)
      }
    });
  
    sequelize.sync({alter: true});
    // sequelize.sync({force: true});
  
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
  } else {
    console.log('database exist');
  }
}

// Export the database instance and models
module.exports = {
  db,
  initialize,
};
