const express = require('express');
const router = express.Router();
const pool = require('../mysql')
const {db} = require('../postgresql')
const  {Op} = require('sequelize');

router.post('/api/parts', async (req, res) => {
  try {
    const {modificationId, categoryId, brands, manufacturerid} = req.body;
    
    if (!modificationId || !categoryId || !manufacturerid || brands.length === 0) res.status(500).send('Не все параметры переданы для поиска запчастей');
    const ids = Array.from(new Set(brands))
    const questionMarks = ids.map(() => "?").join(",");

    const [rows] = await pool.execute(`
      SELECT DISTINCT article_links.supplierid, article_links.datasupplierarticlenumber, suppliers.description
      FROM passanger_car_pds 
      INNER JOIN article_links ON passanger_car_pds.productid = article_links.productid 
      INNER JOIN suppliers ON article_links.supplierid = suppliers.id
      WHERE passanger_car_pds.passangercarid = ? 
          AND passanger_car_pds.nodeid = ? 
          AND article_links.linkageid = ?
          AND suppliers.description IN (${questionMarks})
          `, [modificationId, categoryId, modificationId, ...ids]);

    const supplierId = rows.map(s => s?.supplierid)
    const supplierNumbers = rows.map(s => s?.datasupplierarticlenumber)
    const categoryArticles = rows?.map(a => a?.datasupplierarticlenumber)
    let originalArticles = []

    if (supplierId.length > 0) {
      const questionMarks = supplierId.map(() => "?").join(",");
      const questionMarkNumbers = supplierNumbers.map(() => "?").join(",");

      const [rows] = await pool.execute(`
        SELECT article_oe.OENbr_clr FROM article_oe 
        WHERE article_oe.manufacturerId = ? 
          AND article_oe.supplierid IN (${questionMarks})
          AND article_oe.datasupplierarticlenumber IN (${questionMarkNumbers}) 
        GROUP BY OENbr_clr`, [manufacturerid, ...supplierId, ...supplierNumbers]);
      
      originalArticles = rows.map(a => a?.OENbr_clr)
    }

    const articles = [...categoryArticles, ...originalArticles]

    const p = await db.Part.findAll({
      where: {
        article: {
          [Op.in]: articles
        }
      }
    });
    const parts = p.map(part => {
      return {
        ...part.dataValues,
        brand: {name: part.brand},
        yourPrice: {amount: Number(part.price)},
        images: [],
        remainsAll_2: {...part.remainsAll},
        remainsAll: [],
        remain: Object.values({...part.remainsAll}).reduce((acc, cur) =>  acc + Number(cur.replace(/\s|>|</g, '')) ,0)
      }
    })
    
    console.log('found parts', parts?.length)
    res.json(parts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;