const  { DataTypes: DataType} = require('sequelize');

const Orders = (sequelize) => {
	const Order = sequelize.define('Order', {
		id: { type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true, allowNull: false, field: 'id' },
    user_id: { type: DataType.INTEGER, field: 'user_id' },
    first_name: { type: DataType.STRING, field: 'first_name' },
		phone: { type: DataType.STRING, field: 'phone' },
    email:{ type: DataType.STRING, field: 'email' },
    status: { type: DataType.STRING, field: 'status' },
    parts:{ type: DataType.JSON, field: 'parts' },
    delivery:{ type: DataType.STRING, field: 'delivery' },
    payment:{ type: DataType.STRING, field: 'payment' },
    payment_status:{ type: DataType.BOOLEAN, field: 'payment_status' },
    comment:{ type: DataType.TEXT, field: 'comment' },
    created_at:{ type: DataType.DATE, field: 'created_at' },
    total: {type: DataType.FLOAT, field: 'total'}
	},{
		tableName: 'order',
		timestamps: false,
	})

	return Order
}

module.exports = Orders