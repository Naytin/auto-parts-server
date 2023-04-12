const express = require('express');
const router = express.Router();
const pool = require('../mysql')

router.get('/api/category', async (req, res) => {
  try {
    const modification = req.query.modification;
    const category = req.query.category;

    const [rows] = await pool.execute(`SELECT * FROM passanger_car_trees
    WHERE passangercarid = ? 
    AND LOWER(REGEXP_REPLACE(description, '[,/-]', '-')) LIKE ?`, [modification, `%${category}%`]);
    if (rows.length > 0) {
      res.json(rows[0]);
     } else {
      res.json([]);
     }
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.get('/api/detail2', async (req, res) => {
  try {
    const id = req.query.id;
    const brand = req.query.brand;
    const [rows] = await pool.execute(`
    SELECT article_attributes.description,
      article_attributes.displaytitle, 
      article_attributes.displayvalue, 
      article_attributes.datasupplierarticlenumber,
      article_attributes.supplierid,
      suppliers.description AS brand
    FROM articles
    INNER JOIN suppliers ON suppliers.description = ? 
    INNER JOIN article_attributes ON suppliers.id = article_attributes.supplierid 
      AND articles.DataSupplierArticleNumber = article_attributes.datasupplierarticlenumber 
    WHERE 
      articles.DataSupplierArticleNumber = ?
      OR articles.FoundString = ?
    `, [brand, id, id]);
      
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.get('/api/tables', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = DATABASE();
    `);
      
    const result = rows.reduce((acc, {table_name, column_name}) => {
      if (!acc[table_name]) {
        acc[table_name] = {fields: [column_name]};
      } else {
        acc[table_name].fields.push(column_name);
      }
      return acc;
    }, {});

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router.get('/api/table', async (req, res) => {
  try {
    const id = req.query.id;
    const field = req.query.field;
    const table = req.query.table;
    const [rows] = await pool.execute(`SELECT *
    FROM ${table}
    WHERE ${field} = ? LIMIT 1000`, [id]);
      
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});


router.get('/api/images', async (req, res) => {
  try {
    const id = req.query.id;
    const field = req.query.field;
    const [rows] = await pool.execute(`SELECT *
    FROM article_images 
    WHERE ${field} = ? LIMIT 100`, [id]);
      
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});



router.get('/api/test', async (req, res) => {
  try {
    res.json('Тестовый запрос');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.get('/api/model2', async (req, res) => {
  try { 
    const model = req.query.model;
    const [rows] = await pool.execute(`
      SELECT id, description, manufacturerid FROM models
      WHERE id = ?`, [model]);
      
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});
router.post('/api/model', async (req, res) => {
  try {
    const {model} = req.body;
    const [rows] = await pool.execute(`
      SELECT id, description, manufacturerid FROM models
      WHERE id = ?`, [model]);
      
  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.json([]);
  }
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.post('/api/models', async (req, res) => {
  try {
    const {mark, year} = req.body;
    const [rows] = await pool.execute(`SELECT DISTINCT models.id, models.description, models.constructioninterval 
      FROM models
      INNER JOIN passanger_cars ON models.id = passanger_cars.modelid
      INNER JOIN passanger_car_attributes ON passanger_cars.id = passanger_car_attributes.passangercarid
      WHERE models.manufacturerid = ?
      AND (
        YEAR(STR_TO_DATE(SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', 1), '%m.%Y')) <= ?
        AND (
          YEAR(STR_TO_DATE(SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', -1), '%m.%Y')) >= ?
          OR SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', -1) = ''
        )
        OR SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', -1) = ?
      )
      AND passanger_car_attributes.displayvalue IN ('Фургон', 'автобус', 'вэн', 'Фургон/универсал', 'Самосвал', 'Автомобиль для нужд коммунальног', 'тягач')`, [mark, year, year, year]);
      
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post('/api/modification', async (req, res) => {
  try {
    const {modification} = req.body
    console.log('query', modification)
    const [rows] = await pool.execute(`
    SELECT DISTINCT passanger_cars.id, passanger_cars.description,passanger_cars.fulldescription, passanger_cars.constructioninterval, passanger_cars.modelid, passanger_car_attributes.displayvalue
    FROM passanger_cars
    INNER JOIN passanger_car_attributes ON passanger_cars.id = passanger_car_attributes.passangercarid
    WHERE passanger_cars.id = ?
    AND passanger_car_attributes.attributetype = "FuelType"`, [modification]);
      

   if (rows.length > 0) {
    res.json(rows[0]);
   } else {
    res.json([]);
   }
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.get('/api/detail', async (req, res) => {
  try {
    const id = req.query.id;
    const [rows] = await pool.execute(`SELECT article_attributes.description,article_attributes.displaytitle, article_attributes.displayvalue, article_attributes.datasupplierarticlenumber
    FROM articles
    INNER JOIN article_attributes ON articles.supplierId = article_attributes.supplierid 
    WHERE articles.DataSupplierArticleNumber = ?`, [id]);
      
    if (rows.length > 0) {
      const filtered = rows.filter(d => d.datasupplierarticlenumber === id)
      const detail = filtered.map(d => ({
        attribute: {
          name: d?.displaytitle,
          title: d?.description
        },
        value: d?.displayvalue
      }))
      res.json(detail);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post('/api/category', async (req, res) => {
  try {
    const {modification, category} = req.body
    const [rows] = await pool.execute(`SELECT * FROM passanger_car_trees
    WHERE passangercarid = ? 
    AND LOWER(REGEXP_REPLACE(description, '[,/-]', '-')) LIKE ?`, [modification, `%${category}%`]);

    if (rows.length > 0) {
      res.json(rows[0]);
     } else {
      res.json([]);
     }
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.post('/api/categoryArticles', async (req, res) => {
  try {
    const {categoryId, modificationId, brands} = req.body
    if (!modificationId || !categoryId || brands.length === 0) return []
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
      
        res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.post('/api/tree', async (req, res) => {
  try {
    const {modification} = req.body
    const [rows] = await pool.execute('SELECT passangercarid,id,parentid,description FROM passanger_car_trees WHERE passangercarid = ?', [modification]);
      
    res.json(rows);
   } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.post('/api/engines', async (req, res) => {
  try {
    const {model, year} = req.body
    const [rows] = await pool.execute(`
    SELECT DISTINCT passanger_cars.id, passanger_cars.description,passanger_cars.fulldescription, 
    passanger_cars.constructioninterval, passanger_cars.modelid, passanger_car_attributes.displayvalue
    FROM passanger_cars
    INNER JOIN passanger_car_attributes ON passanger_cars.id = passanger_car_attributes.passangercarid
    WHERE passanger_cars.modelid = ?
    AND (
      YEAR(STR_TO_DATE(SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', 1), '%m.%Y')) <= ?
      AND (
        YEAR(STR_TO_DATE(SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', -1), '%m.%Y')) >= ?
        OR SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', -1) = ''
      )
      OR SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', -1) = ?
    )
    AND passanger_car_attributes.attributetype = "FuelType"`, [model, year, year, year]);
      
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.post('/api/originalArticles', async (req, res) => {
  try {
    const {mark, supplierId, supplierNumber} = req.body
    const questionMarks = supplierId.map(() => "?").join(",");
    const questionMarkNumbers = supplierNumber.map(() => "?").join(",");

    const [rows] = await pool.execute(`
    SELECT article_oe.OENbr_clr FROM article_oe 
    WHERE article_oe.manufacturerId = ? 
      AND article_oe.supplierid IN (${questionMarks})
      AND article_oe.datasupplierarticlenumber IN (${questionMarkNumbers}) 
    GROUP BY OENbr_clr`, [mark, ...supplierId, ...supplierNumber]);
      
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.post('/api/brands', async (req, res) => {
  try {
    const {modificationId, brands} = req.body
    const ids = Array.from(new Set(brands))
    const questionMarks = ids.map(() => "?").join(",");
    
    const [rows] = await pool.execute(`
    SELECT article_links.linkageid, article_links.supplierid, suppliers.description, datasupplierarticlenumber
    FROM article_links 
    INNER JOIN suppliers ON article_links.supplierid = suppliers.id
    WHERE linkageid = ?
    AND suppliers.description IN (${questionMarks})`, [modificationId, ...ids]);
      
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;