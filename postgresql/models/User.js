const {DataTypes: DataType } = require('sequelize');

const User = (sequelize) => {
	const User = sequelize.define('User', {
		id: { type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true, allowNull: false, field: 'id' },
		first_name: { type: DataType.STRING, field: 'first_name' },
		last_name: { type: DataType.STRING, field: 'last_name' },
		middle_name: { type: DataType.STRING, field: 'middle_name' },
		phone: { type: DataType.STRING, field: 'phone' },
		email: { 
			type: DataType.STRING, 
			field: 'email', 
			isUnique :true,
			validate: {
				isEmail: true
			} 
		},
    password: { 
			type: DataType.STRING, 
			field: 'password',
			validate: {
				min: 6
			}
		}
	},{
		tableName: 'user',
		timestamps: true,
	})

  User.associate = (models) => {
    User.hasMany(models.Order, { as: 'orders', sourceKey: 'id', foreignKey: {name: 'user_id'}})
  };

	return User
}

module.exports = User