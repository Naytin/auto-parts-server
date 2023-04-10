const express = require('express');
const router = express.Router();
const {search,analogs, applicability} = require('../uniquetrade')
const {photos} = require('../mysql/actions')

router.post('/api/uniqueTrade/applicability', async (req, res) => {
  try {
    const {query} = req.body;

    const response = await applicability(query)
  
    if (response) {
      res.status(200).json(response)
    } else {
      res.status(404).json({ error: 'Нічого не знайдено'})
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера - search');
  }
});
router.post('/api/uniqueTrade/search', async (req, res) => {
  try {
    const {query, withInfo} = req.body;

    const response = await search(query, withInfo)
  
    if (response) {
      res.status(200).json(response?.details)
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
    
    if (response) {
      const ids = response.map(a => a.article)
      const imgs = await photos(ids)
      const analogs = response.map(a => {
        const img = imgs.find(i => i.DataSupplierArticleNumber === a.article)
        const images = img?.FileName ? [{fullImagePath: `${WEBP_URL}/${img.FileName}`}]: []

        return {...a, images}
      })
      res.status(200).json(analogs)
    } else {
      res.status(404).json({ error: 'Нічого не знайдено'})
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера - analogs');
  }
});

module.exports = router