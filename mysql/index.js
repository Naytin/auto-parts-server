const mysql = require('mysql2/promise');

// Конфигурация подключения к базе данных
const config = {
  host: 'mytecdoc.com',
  user: 'td_test_ip',
  password: 'pG7aQ6hG3l',
  database: 'tecdoc_2022_2_ru',
  connectionLimit: 10,
};

// Создание пула соединений к базе данных
const pool = mysql.createPool(config);

module.exports = pool;