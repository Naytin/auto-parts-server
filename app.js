const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const routes = require('./routes')
const {initialize} = require('./postgresql')
const cronJob = require('./uniquetrade')

const PORT = process.env.PORT || 8081;
// Конфигурация подключения к базе данных

// Разрешить CORS
app.use((req, res, next) => { next(); }, cors({ maxAge: 84600 }));
app.use(bodyParser.json())

app.use('/', routes); 
//init database 
initialize()
// cronJob()

// Запуск сервера
app.listen(8081, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/api`);
});


module.exports = app;