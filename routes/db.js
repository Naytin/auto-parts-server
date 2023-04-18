const express = require('express');
const router = express.Router();
const pool = require('../mysql')
const {db} = require('../postgresql')
const {filterPartByExist, addPercent} = require('../utils')
const {WEBP_URL, BRANDS_CHANGE, margin_percentage} = require('../consts')
const {photos, articles, articles_original} = require('../mysql/actions')
const {searchList} = require('../uniquetrade')
const  {Op} = require('sequelize');
const order = require('../postgresql/resolvers/order')
const reviews = require('../postgresql/resolvers/reviews')
const tree = require('../postgresql/resolvers/tree')
const user = require('../postgresql/resolvers/user')

// orders - start
router.post('/api/db/order', async (req, res) => {
  try {
    const id = await order.createOrder(req.body.field)
        
    if (id) {
      res.status(200).json({
        error: false,
        message: `Замовлення успішно створене. Номер замовлення - ${id}`
      })
    } else {
      res.status(200).json({
        error: true,
        message: `Сталося помилка - спробуйте ще раз`,
      })
    }
  } catch (error) {
    res.status(500).send('Ошибка сервера');
  }
})
router.get('/api/db/order', async (req, res) => {
  try {
    const orders = await order.Orders()
       
    if (orders) {
      res.status(200).json(orders)
    } else {
      res.status(200).json({
        error: true,
        message: `Сталося помилка отримання замовлень`,
      })
    }
  } catch (error) {
    res.status(500).send('Ошибка сервера');
  }
})
router.put('/api/db/order', async (req, res) => {
  try {
    const orders = await order.ChangeStatus(req.body.field)
    
    if (orders) {
      res.status(200).json({
        error: false,
        message: `Статус успішно змінено - ${req.body.field.id}`
      })
    } else {
      res.status(200).json({
        error: true,
        message: `Сталося помилка зміни статуса`,
      })
    }
  } catch (error) {
    res.status(500).send('Ошибка сервера');
  }
})
// orders - end
//
// reviews - start
router.post('/api/db/reviews', async (req, res) => {
  try {
    const review = await reviews.createReview(req.body.field)
    if (review) {
      res.status(200).json({
        error: false,
        message: 'Відгук успішно додано'
      })
    } else {
      res.status(200).json({
        error: true,
        message: 'Сталося помилка - спробуйте ще раз'
      })
    }
  } catch (error) {
    res.status(500).send('Ошибка сервера');
  }
})
router.get('/api/db/reviews', async (req, res) => {
  try {
    const review = await reviews.getReviews()

    if (review) {
      res.status(200).json(review)
    } else {
      res.status(200).json({
        error: true,
        message: 'Сталося помилка - спробуйте ще раз'
      })
    }
  } catch (error) {
    res.status(500).send('Ошибка сервера');
  }
})
// reviews - end
// 
// tree - start
router.post('/api/db/tree', async (req, res) => {
  try {
    const treeTranslate = await tree.createTreeTranslate(req.body)

    if (treeTranslate) {
      res.status(200).json({
        error: false,
        message: 'переклад успішно додано'
      })
    } else {
      res.status(200).json({
        error: true,
        message: 'Сталося помилка - спробуйте ще раз'
      })
    }
  } catch (error) {
    res.status(500).send('Ошибка сервера');
  }
})
router.put('/api/db/tree', async (req, res) => {
  try {
    const treeError = await tree.updateTreeError(req.body)

    if (treeError) {
      res.status(200).json({
        error: false,
        message: 'категорію успішно додано'
      })
    } else {
      res.status(200).json({
        error: true,
        message: 'Сталося помилка - спробуйте ще раз'
      })
    }
  } catch (error) {
    res.status(500).send('Ошибка сервера');
  }
})
router.get('/api/db/tree', async (req, res) => {
  try {
    const treeTranslate = await tree.getTreeTranslate()

    if (treeTranslate) {
      res.status(200).json(treeTranslate)
    } else {
      res.status(200).json({
        error: true,
        message: 'Сталося помилка - спробуйте ще раз'
      })
    }
  } catch (error) {
    res.status(500).send('Ошибка сервера');
  }
})
// tree - end
//
// user - start
router.get('/api/db/user', async (req, res) => {
  try {
    const users = await user.Users()

    if (users) {
      res.status(200).json(users)
    } else {
      res.status(200).json({
        error: true,
        message: `Сталося помилка отримання користувачів`,
      })
    }
  } catch (error) {
    res.status(500).send('Ошибка сервера');
  }
})
// user - end
//
// get parts
router.post('/api/parts', async (req, res) => {
  try {
    const {modificationId, categoryId, brands, manufacturerid} = req.body;
    
    if (!modificationId || !categoryId || !manufacturerid || brands.length === 0) res.status(500).send('Не все параметры переданы для поиска запчастей');
   
    const rows = await articles(brands,modificationId,categoryId)

    const supplierId = rows.map(s => s?.supplierid)
    const supplierNumbers = rows.map(s => s?.datasupplierarticlenumber)
    const categoryArticles = rows?.map(a => a?.datasupplierarticlenumber)
    const brand = rows?.map(a => a?.description)
    let originalArticles = []

    if (supplierId.length > 0) {
      const rows = await articles_original(supplierId, supplierNumbers, manufacturerid)
      
      originalArticles = rows.map(a => a?.OENbr_clr)
    }

    const all_articles = [...categoryArticles, ...originalArticles]
    
    const p = await db.Part.findAll({
      where: {
        article: {
          [Op.in]: categoryArticles
        },
        brand: {
          [Op.in]: brand
        }
      }
    });

    if (p.length > 0) {
      //get images 
      const ids = p.map(part => part.article)
      const brands = p.map(part => BRANDS_CHANGE[part.brand] || part.brand)
      const rows = await photos(ids, brands)
        
      const list = p.map(part => ({oem: part.article, brand: part.brand}))
      //get details about part
      // const result = await searchList(list)
      //prepare details
      // const details = result?.map(p => {
      //   if (p?.details?.length > 0) {
      //     return filterPartByExist({...p.details[0]})
      //   }
      // })
      //prepare parts with details
      const parts = p.map(part => {
        const brand = BRANDS_CHANGE[part.brand] || part.brand
        const img = rows?.filter(i => i.DataSupplierArticleNumber.replace(/\s|\//g, '') === part.article.replace(/\s|\//g, '') && i.brand === brand)
        const images = img?.length > 0 ? img.map(im =>  ({fullImagePath: `${WEBP_URL}/${im.FileName}`})) : []
        // const images = img?.FileName ? [{fullImagePath: `${WEBP_URL}/${img.FileName}`}]: []
        // const current = details.find(d => d?.article === part.article)
        // const {id, yourPrice, availability, toOrder,remainsAll, remains} = current
        //{storage: {id: number, name: string, originalName: string}, remain: string}[]
        return {
          ...part.dataValues,
          brand: {name: part.brand},
          // yourPrice: yourPrice,
          yourPrice: {amount: addPercent(part.price, margin_percentage)},
          images: images,
          remainsAll: Object.entries(part.remainsAll).map(([key, value]) => ({storage: {name: key}, remain: value})),
          // remainsAll: remainsAll || [],
          // remains,
          // id,
          // availability, 
          // toOrder,
          remain: Object.values({...part.remainsAll}).reduce((acc, cur) =>  acc + Number(cur.replace(/\s|>|</g, '')) ,0)
        }
      })
      
      console.log('found parts', parts?.length)
      res.json(parts);
    } else {
      res.json(p);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;