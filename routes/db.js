const express = require('express');
const router = express.Router();
const {db} = require('../postgresql')
const {articles, articles_original} = require('../mysql/actions')
const {prepareParts,brandsForTecdoc, brandsFromTecdoc} = require('../utils/parts')
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
    throw new Error(error) 
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
    throw new Error(error) 
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
    throw new Error(error) 
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
    throw new Error(error) 
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
    throw new Error(error) 
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
    throw new Error(error) 
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
    throw new Error(error) 
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
    throw new Error(error) 
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
    throw new Error(error) 
  }
})
// user - end
//
// get parts
router.get('/api/db/categories2', async (req, res) => {
  try {
    const categories = await db.Part.findAll({attributes: ['category']});
    const c = categories.filter(r => Boolean(r.category))
      .map(a => a.category)
      .flat()
    const result = Array.from(new Set(c))

    res.status(200).json({count: result.length, ids: result})
  }
  catch(error) {
    throw new Error(error) 
  }
})

router.get('/api/db/categories', async (req, res) => {
  try {
    // console.log('start')
    // await tree.updateTree()
    // console.log('get')
    const t = await db.Tree.findOne({where: {id: 1}},{attributes: ['tree']});
  
    
    res.status(200).json(t.tree)
  } catch (error) {
    throw new Error(error) 
  }
})

router.get('/api/db/category', async (req, res) => {
  try {
    const categoryId = req.query.id

    const result = await db.Part.findAll({
      where: {
        category: {
          [Op.contains]: [Number(categoryId)]
        }
      }
    });

    if (Boolean(result.length)) {
      const parts = await prepareParts(result)
      res.status(200).json(parts)
    } else {
      res.status(200).json([])
    }
  } catch (error) {
    throw new Error(error) 
  }
})
router.post('/api/parts', async (req, res) => {
  try {
    const {modificationId, categoryId, manufacturerid} = req.body;
    
    if (!modificationId || !categoryId || !manufacturerid) res.status(500).send('Не все параметры переданы для поиска запчастей');
    const b = await db.Brands.findAll()
    const preparedB = b.map(r => r.name)
    const arr = await brandsForTecdoc(preparedB)

    const rows = await articles(arr,modificationId,categoryId)
  
    const supplierId = rows.map(s => s?.supplierid)
    const supplierNumbers = rows.map(s => s?.datasupplierarticlenumber)
    const categoryArticles = rows?.map(a => a?.datasupplierarticlenumber.replace(/\s/g, ''))
    const all = rows?.map(a => ({article: a?.datasupplierarticlenumber, brand: a?.description}))
    const brand = rows?.map(a => a?.description)
    let originalArticles = []
    const compareBrands = await brandsFromTecdoc(brand)

    if (supplierId.length > 0) {
      const rows = await articles_original(supplierId, supplierNumbers, manufacturerid)
      
      originalArticles = rows.map(a => a?.OENbr_clr.replace(/\s|\//g, ''))
    }
    
    let p = await db.Part.findAll({
      where: {
        [Op.or]: [
          {
            article: { [Op.in]: supplierNumbers },
            brand: { [Op.in]: compareBrands } 
          },
          {
            article: { [Op.in]: categoryArticles },
            brand: { [Op.in]: compareBrands } 
          },
          {
            article: {
              [Op.in]: originalArticles,
            },
          }
        ],
      }
    });

    if (p.length > 0) {
      //prepare parts with details
      const parts = await prepareParts(p)
      
      res.json(parts);
    } else {
      res.json(p);
    }
  } catch (err) {
    throw new Error(err) 
  }
});

module.exports = router;


// const ids = p.map(part => part.article)
//       const b = p.map(part => part.brand)
//       //prepare brands
//       const brands = await brandsForTecdoc(b)
//       //get images 
//       const rows = await photos(ids, brands)
//       // const list = p.map(part => ({oem: part.article, brand: part.brand}))
//       //get details about part
//       // const result = await searchList(list)
//       //prepare details
//       // const details = result?.map(p => {
//       //   if (p?.details?.length > 0) {
//       //     return filterPartByExist({...p.details[0]})
//       //   }
//       // })
//       //prepare parts with details
//       const parts = p.map(part => {
//         const brand = tecdoc_brands[part.brand] || [part.brand]
       
//         const img = rows?.filter(i => i.DataSupplierArticleNumber.replace(/\s|\//g, '') === part.article.replace(/\s|\//g, '') && brand.includes(i.brand))
//         const images = img?.length > 0 ? img.map(im =>  ({fullImagePath: `${WEBP_URL}/${im.FileName}`})) : []
//         // const images = img?.FileName ? [{fullImagePath: `${WEBP_URL}/${img.FileName}`}]: []
//         // const current = details.find(d => d?.article === part.article)
//         // const {id, yourPrice, availability, toOrder,remainsAll, remains} = current
//         //{storage: {id: number, name: string, originalName: string}, remain: string}[]
//         const price = Number(part.price)
//         return {
//           ...part.dataValues,
//           brand: {name: part.brand},
//           yourPrice: {amount: addPercent(price, margin_percentage)},
//           images: images,
//           remains: Object.entries(part.remainsAll).map(([key, value]) => ({storage: {name: key}, remain: value})),
//           // remainsAll: remainsAll || [],
//           // remains,
//           // id,
//           // availability, 
//           // toOrder,
//           // articles: art,
//           remain: Object.values({...part.remainsAll}).reduce((acc, cur) =>  acc + Number(cur.replace(/\s|>|</g, '')) ,0)
//         }
//       })