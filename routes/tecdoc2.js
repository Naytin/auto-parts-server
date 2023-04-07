const express = require('express');
const router = express.Router();
const pool = require('../mysql')


router.get('/api/models222', async (req, res) => {
  try {
    const mark = req.query.mark;
    const year = req.query.year;
    const [rows] = await pool.execute(`SELECT DISTINCT models.id, models.description, models.constructioninterval 
      FROM models
      INNER JOIN passanger_cars ON models.id = passanger_cars.modelid
      INNER JOIN passanger_car_attributes ON passanger_cars.id = passanger_car_attributes.passangercarid
      WHERE models.manufacturerid = ?
      AND passanger_car_attributes.displayvalue IN ('Фургон', 'автобус', 'вэн', 'Фургон/универсал', 'Самосвал', 'Автомобиль для нужд коммунальног', 'тягач')`, [mark]);
      
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.get('/api/models22', async (req, res) => {
  try {
    const mark = req.query.mark;
    const year = req.query.year;
    const [rows] = await pool.execute(`SELECT DISTINCT models.id, models.description, models.constructioninterval 
      FROM models
      INNER JOIN passanger_cars ON models.id = passanger_cars.modelid
      INNER JOIN passanger_car_attributes ON passanger_cars.id = passanger_car_attributes.passangercarid
      WHERE models.manufacturerid = ?
      AND (
        SUBSTRING(passanger_cars.constructioninterval, -4) = ?
        OR SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', 1) LIKE ?
        OR SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', -1) LIKE ?
      )
      AND passanger_car_attributes.displayvalue IN ('Фургон', 'автобус', 'вэн', 'Фургон/универсал', 'Самосвал', 'Автомобиль для нужд коммунальног', 'тягач')`, [mark, year, `%.${year}`, `%.${year}`]);
      
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router.get('/api/engines3', async (req, res) => {
  try {
    const model = req.query.model;
    const year = req.query.year;
    const [rows] = await pool.execute(`
    SELECT DISTINCT passanger_cars.id, passanger_cars.description,passanger_cars.fulldescription, 
    passanger_cars.constructioninterval, passanger_cars.modelid, passanger_car_attributes.displayvalue
    FROM passanger_cars
    INNER JOIN passanger_car_attributes ON passanger_cars.id = passanger_car_attributes.passangercarid
    WHERE passanger_cars.modelid = ?
    AND SUBSTRING(passanger_cars.constructioninterval, -4) >= ?
    AND passanger_car_attributes.attributetype = "FuelType"`, [model, year]);
      
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
  }
});
router.get('/api/engines2', async (req, res) => {
  try {
    const model = req.query.model;
    const year = req.query.year;
    const [rows] = await pool.execute(`
    SELECT DISTINCT passanger_cars.id, passanger_cars.description,passanger_cars.fulldescription, 
    passanger_cars.constructioninterval, passanger_cars.modelid, passanger_car_attributes.displayvalue
    FROM passanger_cars
    INNER JOIN passanger_car_attributes ON passanger_cars.id = passanger_car_attributes.passangercarid
    WHERE passanger_cars.modelid = ?
    AND (
      (SUBSTRING(passanger_cars.constructioninterval, -4) = ?)
      OR (SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', 1) BETWEEN 1980 AND ?)
      OR (SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', -1) BETWEEN 1980 AND ?)
    )
    AND passanger_car_attributes.attributetype = "FuelType"`, [model, year, `%.${year}`, `%.${year}`]);
      
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
  }
});
router.post('/api/engines22', async (req, res) => {
  try {
    const {model, year} = req.body
    const [rows] = await pool.execute(`
    SELECT DISTINCT passanger_cars.id, passanger_cars.description,passanger_cars.fulldescription, 
    passanger_cars.constructioninterval, passanger_cars.modelid, passanger_car_attributes.displayvalue
    FROM passanger_cars
    INNER JOIN passanger_car_attributes ON passanger_cars.id = passanger_car_attributes.passangercarid
    WHERE passanger_cars.modelid = ?
    AND passanger_car_attributes.attributetype = "FuelType"`, [model]);
      
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
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
        (SUBSTRING(passanger_cars.constructioninterval, -4) = ?)
        OR (SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', 1) BETWEEN 1980 AND ?)
        OR (SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', -1) BETWEEN 1980 AND ?)
      )
      AND passanger_car_attributes.displayvalue IN ('Фургон', 'автобус', 'вэн', 'Фургон/универсал', 'Самосвал', 'Автомобиль для нужд коммунальног', 'тягач')`, [mark, year]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post('/api/models2', async (req, res) => {
  try {
    const {mark, year} = req.body;
    const [rows] = await pool.execute(`SELECT DISTINCT models.id, models.description, models.constructioninterval 
      FROM models
      INNER JOIN passanger_cars ON models.id = passanger_cars.modelid
      INNER JOIN passanger_car_attributes ON passanger_cars.id = passanger_car_attributes.passangercarid
      WHERE models.manufacturerid = ?
      AND passanger_car_attributes.displayvalue IN ('Фургон', 'автобус', 'вэн', 'Фургон/универсал', 'Самосвал', 'Автомобиль для нужд коммунальног', 'тягач')`, [mark]);

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
    SELECT DISTINCT passanger_cars.id, passanger_cars.description,passanger_cars.fulldescription, passanger_cars.constructioninterval, passanger_cars.mo>
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

router.post('/api/category', async (req, res) => {
  try {
    const {modification, category} = req.body
    const [rows] = await pool.execute(`SELECT * FROM passanger_car_trees
    WHERE passangercarid = ? 
    AND LOWER(REGEXP_REPLACE(description, '[,/-]', '')) LIKE ?`, [modification, `%${category}%`]);

    if (rows.length > 0) {
      res.json(rows[0]);
     } else {
      res.json([]);
     }
  } catch (error) {
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
  } catch (error) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

router.post('/api/tree', async (req, res) => {
  try {
    const {modification} = req.body
    const [rows] = await pool.execute('SELECT passangercarid,id,parentid,description FROM passanger_car_trees WHERE passangercarid = ?', [modification]);
      
    res.json(rows);
  } catch (error) {
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
      (SUBSTRING(passanger_cars.constructioninterval, -4) = ?)
      OR (SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', 1) BETWEEN 1980 AND ?)
      OR (SUBSTRING_INDEX(passanger_cars.constructioninterval, ' - ', -1) BETWEEN 1980 AND ?)
    )
    AND passanger_car_attributes.attributetype = "FuelType"`, [model, year, `%.${year}`, `%.${year}`]);
      
    res.json(rows);
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;