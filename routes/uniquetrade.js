const express = require('express');
const router = express.Router();
const {search,analogs, applicability, searchList, check} = require('../uniquetrade')
const {photos, detail} = require('../mysql/actions')
const {WEBP_URL} = require('../consts')
const {brandsForTecdoc} = require('../utils/parts')
const {getData} = require('../utils')

router.post('/api/uniqueTrade/searchList', async (req, res) => {
  try {
    const {list} = req.body;
    const tecdoc_brands = await getData('/usr/local/lsws/Example/html/node/auto-parts-server/data/brands_for_request.json', false)
    const response = await searchList(list)
  
    if (Boolean(response?.length) && response[0].details?.length > 0) {
      let part = response[0].details[0]
      const brands = tecdoc_brands[part.brand.name] || [part.brand.name]
      
      //get info and photo from tecdoc if not exists
      if (!Boolean(part?.detailAkeneoInfo?.length)) {
        const details = await detail(part.article, brands)
        part.detailInfo = details
      } else {
        part.detailInfo = part?.detailAkeneoInfo
      }
      //
      if (!Boolean(part?.images?.length)) {
        const img = await photos([part.article], brands)
        const images = img?.length > 0 ? img.map(im =>  ({fullImagePath: `${WEBP_URL}/${im.FileName}`})) : []
        part.images = images
      } else {
        part.images = part?.images.map(img => ({fullImagePath: img?.fullImagePath, thumbnail: img?.thumbnail}))
      }
      
      const {
        detailInfo, 
        detailCard, 
        remains, 
        remainsAll, 
        title,
        article, 
        brand, 
        displayBrand, 
        yourPrice, 
        yourPriceEUR, 
        id, 
        images, 
        category} = part
      
      res.status(200).json({detailInfo, detailCard, remains, remainsAll, title,article, brand, displayBrand, yourPrice, yourPriceEUR, id, images, category})
    } else {
      res.status(200).json({})
    }
  } catch (err) {
    throw new Error(err)
  }
});

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
    throw new Error(err)
  }
});

router.post('/api/uniqueTrade/checkPrice', async (req, res) => {
  try {
    const {query, brand} = req.body;
    
    const response = await check(query, brand)
  
    if (response) {
      const data = response?.details

      res.status(200).json(data[0])
    } else {
      res.status(404).json({ error: 'Нічого не знайдено'})
    }
  } catch (err) {
    throw new Error(err)
  }
});
router.post('/api/uniqueTrade/search', async (req, res) => {
  try {
    const {query, withInfo} = req.body;
    
    const response = await search(query, withInfo)
  
    if (response) {
      const data = response?.details
      const tecdoc_brands = await getData('/usr/local/lsws/Example/html/node/auto-parts-server/data/brands_for_request.json', false)

      //if there are no details, get them from tecdoc
      for (const [index, value] of data?.entries()) {
        if (!Boolean(value.detailInfo?.length) && value?.article && withInfo) {
          
          const brands = tecdoc_brands[value.brand.name] || [value.brand.name]
          const details = await detail(value.article, brands)
          data[index].detailInfo = details
        }

        if (!Boolean(data?.images?.length)) {
          const brands = tecdoc_brands[value.brand.name] || [value.brand.name]
          const img = await photos([value.article], brands)
          const images = img?.length > 0 ? img.map(im =>  ({fullImagePath: `${WEBP_URL}/${im.FileName}`})) : []
          data[index].images = images
        }
      }

      res.status(200).json(data)
    } else {
      res.status(404).json({ error: 'Нічого не знайдено'})
    }
  } catch (err) {
    throw new Error(err)
  }
});

router.post('/api/uniqueTrade/analogs-images', async (req, res) => {
  try {
    const {brand, article} = req.body
    const response = await analogs(brand, article)
    
    if (response) {
      const ids = response.map(a => a.article)
      const b = response.map(a => a.brand.name)
      const brands = await brandsForTecdoc(b)
      const imgs = await photos(ids, brands)
     
      res.status(200).json(imgs)
    } else {
      res.status(404).json({ error: 'Нічого не знайдено'})
    }
  } catch (err) {
    throw new Error(err)
  }
});

router.post('/api/uniqueTrade/analogs', async (req, res) => {
  try {
    const {brand, article} = req.body
    const response = await analogs(brand, article)
    
    if (response) {
      const ids = response.map(a => a.article)
      const b = response.map(a => a.brand.name)
      const brands = await brandsForTecdoc(b)
      const imgs = await photos(ids, brands)
      const analogs = response.map(a => {
        const img = imgs?.filter(i => i.DataSupplierArticleNumber.replace(/\s|\//g, '') === a.article.replace(/\s|\//g, ''))
        const images = img?.length > 0 ? img.map(im =>  ({fullImagePath: `${WEBP_URL}/${im.FileName}`})) : []

        return {...a, images}
      })
      res.status(200).json(analogs)
    } else {
      res.status(404).json({ error: 'Нічого не знайдено'})
    }
  } catch (err) {
    throw new Error(err)
  }
});

module.exports = router