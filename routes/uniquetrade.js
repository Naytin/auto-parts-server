const express = require('express');
const router = express.Router();
const {search,analogs, applicability} = require('../uniquetrade')
const {photos, detail} = require('../mysql/actions')
const {WEBP_URL} = require('../consts')

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
      const data = response?.details

      //if there are no details, get them from tecdoc
      if (!Boolean(data.detailInfo?.length) && data?.article) {
        console.log('detail not found', data.detailInfo)
        const details = await detail(data.article, data.brand.name)
    
        data.detailInfo = details
      }

      res.status(200).json(data)
    } else {
      res.status(404).json({ error: 'Нічого не знайдено'})
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post('/api/uniqueTrade/analogs', async (req, res) => {
  try {
    const {brand, article} = req.body
    const response = await analogs(brand, article)
    
    if (response) {
      const ids = response.map(a => a.article)
      const brands = response.map(a => a.brand.name)
      
      const imgs = await photos(ids, brands)
      const analogs = response.map(a => {
        const img = imgs?.filter(i => i.DataSupplierArticleNumber === a.article)
        const images = img?.length > 0 ? img.map(im =>  ({fullImagePath: `${WEBP_URL}/${im.FileName}`})) : []

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