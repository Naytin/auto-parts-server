const {DataTypes: DataType } = require('sequelize');

const Settings = (sequelize) => {
	const Settings = sequelize.define('Settings', {
		id: { type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true, allowNull: false, field: 'id' },
    uniq_trade_token: { type: DataType.TEXT, field: 'uniq_trade_token' },
    expiration_date:{ type: DataType.DATE, field: 'expiration_date' }
	},{
		tableName: 'settings',
		timestamps: false,
	})

	return Settings
}

module.exports = Settings