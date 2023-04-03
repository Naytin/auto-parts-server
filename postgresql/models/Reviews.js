const {DataTypes: DataType } = require('sequelize');

const Reviews = (sequelize) => {
	const Reviews = sequelize.define('Reviews', {
		id: { type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true, allowNull: false, field: 'id' },
    text: { type: DataType.TEXT, field: 'text' },
    name:{ type: DataType.STRING, field: 'name' },
    email:{ type: DataType.STRING, field: 'email' },
    rating:{ type: DataType.INTEGER, field: 'rating' },
    status:{ type: DataType.BOOLEAN, field: 'status' },
    created_at:{ type: DataType.DATE, field: 'created_at' },
	},{
		tableName: 'reviews',
		timestamps: false,
	})

	return Reviews
}


module.exports = Reviews