const express = require('express');
const router = express.Router();
const pool = require('../mysql')
const {detail} = require('../mysql/actions')

router.get('/api/category', async (req, res) => {
  try {
    res.status(200).json({res: 'test'})
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
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


// router.post('/api/images', async (req, res) => {
//   try {
//     const {id, brands} = req.body;
//     const rows = await photos(id, brands)
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });

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
    const brand = req.query.brand;
    const tecdoc_brands = await getData('/usr/local/lsws/Example/html/node/auto-parts-server/data/brands_for_request.json', false)
    const brands = tecdoc_brands[brand] || [brand]
    const response = await detail(id, brands)
    
    res.json(response);
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

module.exports = router;