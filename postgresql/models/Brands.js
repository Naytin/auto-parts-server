const  { DataTypes: DataType} = require('sequelize');

const Brands = (sequelize) => {
	const Brands = sequelize.define('Brands', {
		id: { type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true, allowNull: false, field: 'id' },
    name: { type: DataType.STRING, field: 'name' }
	},{
		tableName: 'brands',
		timestamps: false,
	})

	return Brands
}

module.exports = Brands