const {DataTypes: DataType } = require('sequelize');

const Tree =  (sequelize) => {
	const Tree = sequelize.define('Tree', {
		id: { type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true, allowNull: false, field: 'id' },
    tree: { type: DataType.JSON, field: 'tree' },
    treeError: { type: DataType.JSON, field: 'treeError' },
	},{
		tableName: 'tree',
		timestamps: false,
	})

	return Tree
}

module.exports = Tree
