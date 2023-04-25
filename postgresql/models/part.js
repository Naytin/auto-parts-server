const {DataTypes: DataType } = require('sequelize');

const Part = (sequelize) => {
	const Part = sequelize.define('Part', {
		id: { type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true, allowNull: false, field: 'id' },
    article: { type: DataType.STRING, field: 'article'},
		article_search: { type: DataType.STRING, field: 'article_search'},
    title: { type: DataType.STRING, field: 'title' },
		brand: { type: DataType.STRING, field: 'brand' },
    price:{ type: DataType.STRING, field: 'price' },
    currency:{ type: DataType.STRING, field: 'currency' },
    remainsAll:{ type: DataType.JSON, field: 'remainAll' },
    remain:{ type: DataType.INTEGER, field: 'remain' },
		tArticle: { type: DataType.STRING, field: 'tArticle'},
    supplierid: { type: DataType.INTEGER, field: 'supplierid'},
    productid: { type: DataType.INTEGER, field: 'productid'},
    tBrand: { type: DataType.STRING, field: 'tBrand'},
    category: { type: DataType.JSON, field: 'category'}
	},{
		tableName: 'part',
		timestamps: false,
	})

	return Part
}

module.exports = Part;