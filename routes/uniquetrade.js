const express = require('express');
const router = express.Router();
const {search,analogs} = require('../uniquetrade')

router.post('/api/uniqueTrade/search', async (req, res) => {
  try {
    const {query, withInfo} = req.body;

    const response = await search(query, withInfo)
  
    if (response?.status === 200) {
      res.status(200).json(response.data.details)
    } else {
      res.status(404).json({ error: 'Нічого не знайдено'})
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера - search');
  }
});

router.post('/api/uniqueTrade/analogs', async (req, res) => {
  try {
    const {brand, article} = req.body
    const response = await analogs(brand, article)
  
    if (response?.status === 200) {
      res.status(200).json(response.data)
    } else {
      res.status(404).json({ error: 'Нічого не знайдено'})
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера - analogs');
  }
});

module.exports = router