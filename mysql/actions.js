const pool = require('./')
const {preparePartsForDB, getData, exportResults} = require('../utils')
const articles = async (brands, modificationId, categoryId) => {
  try {
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

    return rows;
  } catch (error) {
    
  }
}

const articles_original = async (supplierId, supplierNumbers, manufacturerid) => {
  try {
    const questionMarks = supplierId.map(() => "?").join(",");
    const questionMarkNumbers = supplierNumbers.map(() => "?").join(",");

    const [rows] = await pool.execute(`
      SELECT article_oe.OENbr_clr FROM article_oe 
      WHERE article_oe.manufacturerId = ? 
        AND article_oe.supplierid IN (${questionMarks})
        AND article_oe.datasupplierarticlenumber IN (${questionMarkNumbers}) 
      GROUP BY OENbr_clr`, [manufacturerid, ...supplierId, ...supplierNumbers]);

    return rows;
  } catch (error) {
    
  }
}

const photos = async (ids, brands) => {
  try {
    const questionMarks = ids.map(() => "?").join(",");
    const questionMarksBrands = brands.map(() => "?").join(",");
    // const [rows] = await pool.execute(`SELECT FileName,supplierId,DataSupplierArticleNumber
    //   FROM article_images 
    //   WHERE DataSupplierArticleNumber IN (${questionMarks})`, [...ids]);

    const [rows] = await pool.execute(`SELECT article_images.DataSupplierArticleNumber, article_images.supplierId, article_images.PictureName
    , article_images.FileName,suppliers.description as brand
    FROM articles
    INNER JOIN suppliers ON articles.supplierId = suppliers.id and suppliers.description IN (${questionMarksBrands})
    INNER JOIN article_images ON articles.supplierId = article_images.supplierid  AND article_images.DataSupplierArticleNumber = articles.DataSupplierArticleNumber
    where articles.DataSupplierArticleNumber IN (${questionMarks}) or FoundString IN (${questionMarks}) group by FileName`, [...brands, ...ids, ...ids]);
    
    return rows;
  } catch (error) {
    console.log('photos error', error)
  }
}

const detail = async (id, brand) => {
  try {
    const [rows] = await pool.execute(`SELECT articles.DataSupplierArticleNumber, articles.supplierId, suppliers.description as brand
    , article_attributes.description, article_attributes.displaytitle, article_attributes.displayvalue
    FROM articles
    INNER JOIN suppliers ON articles.supplierId = suppliers.id and suppliers.description = ?
    INNER JOIN article_attributes ON articles.supplierId = article_attributes.supplierid  AND article_attributes.DataSupplierArticleNumber = articles.DataSupplierArticleNumber
    where articles.DataSupplierArticleNumber = ? or FoundString = ?`, [brand, id, id]);
      
    if (rows.length > 0) {
      const detail = rows.map(d => ({
        attribute: {
          name: d?.displaytitle,
          title: d?.description
        },
        value: d?.displayvalue,
        article: d.DataSupplierArticleNumber,
        brand: d?.brand
      }))

      return detail;
    } else {
      return []
    }
  } catch (error) {
    
  }
}

const articleCategory = async (article) => {
  try {
    const categories = await getData('/data/categories.json')
    console.log('start articleCategory')
    //check if category exists
    const articles = article.filter(a => {
      const n = categories.filter(n => n.productid === a.productid && n.supplierid === a.supplierid)
      if (!Boolean(n.length)) {
        return a
      }
    })

    const batchSize = 20;
    const cat = []

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      const request = batch?.map((p, idx) => {
        if (idx === batch.length - 1 ) {
          return `(passanger_car_pds.productid = ${p.productid} AND passanger_car_pds.supplierid = ${p.supplierid})`
        }
        return `(passanger_car_pds.productid = ${p.productid} AND passanger_car_pds.supplierid = ${p.supplierid}) OR`
      }).join('\n')
      console.log('request', i, 'Category', batch.length)

      const [rows] = await pool.execute(`SELECT * 
        FROM passanger_car_pds 
        where 
        ${request}
        group by nodeid, supplierid, productid;
        `)

      cat.push(...rows)
    }

    if (articles.length > 0) {
      console.log('found cat', cat.length)
      const category = [...categories, ...cat]

      const changed = await preparePartsForDB(article, category)
      await exportResults(category, '/data/categories.json')
     
      return changed;
    }
    console.log('articleCategory pass')
    return await preparePartsForDB(article, categories)
  } catch (error) {
    console.log('articleCategory error', error)
  }
}

const category = async (pricelist) => {
  try {
    const brands = await getData('/data/brands_for_request.json')
    const modif = await getData('/data/passanger_bus.json')
    const tecdoc_brands = await getData('/data/brands_from_tecdoc.json')
    // const arr = await getData('/data/arr.json')
    const ids = modif.map(m => m.id)
    const questionMarks = modif.map(() => "?").join(",");
    const batchSize = 1000;
    const arr = []
    console.log('all', pricelist?.length)
    
    for (let i = 0; i < pricelist.length; i += batchSize) {
      const batch = pricelist.slice(i, i + batchSize);
   
      const request = batch?.map((p, idx) => {
        const art = p['Артикул']
        
        const article = art.replace(/[^a-zA-Z0-9]/g, '')
        const brand = brands[p['Бренд']] ? brands[p['Бренд']].map((brand) => `'${brand}'`).join(',') : `'${p['Бренд']}'`;
        
        if (idx === batch.length - 1 ) {
          return `(articles.FoundString = "${article}" AND suppliers.description IN (${brand}))`
        }
        return `(articles.FoundString = "${article}" AND suppliers.description IN (${brand})) OR`
      }).join('\n')
      console.log('request', i, 'parts', batch.length)
      
      const [rows] = await pool.execute(`SELECT article_links.datasupplierarticlenumber, articles.supplierid, suppliers.description, article_links.productid
        FROM articles
        inner JOIN article_links ON article_links.datasupplierarticlenumber = articles.datasupplierarticlenumber 
          AND article_links.supplierid = articles.supplierId
          AND article_links.linkageid in (${questionMarks})
        inner JOIN suppliers ON articles.supplierid = suppliers.id 
        where 
        ${request}
        group by article_links.datasupplierarticlenumber, suppliers.description;
        `,[...ids])
  
        console.log('found', rows.length)
        console.log('all', arr.length)
        if (Boolean(rows.length)) {
          const changed = await articleCategory(rows)
          
          arr.push(...changed)
        }
    }
    console.log('finish parts', arr.length)
    let count = 0
  
    for(const [index, p] of pricelist.entries()) {
      const key = p['Артикул'].replace(/[^a-zA-Z0-9]/g, '')

      const detail = arr.find(a => {
        const brands = tecdoc_brands[a.description] || [p['Бренд']]

        if (a.datasupplierarticlenumber.replace(/[^a-zA-Z0-9]/g, '') === key && brands.includes(p['Бренд'])) {
          return a
        }
      })
      console.log('part', index)
      if (detail) {
        count++
        pricelist[index] = {...p, ...detail}
      }
    }
    console.log('all parts', arr.length)
    console.log({count})
    return pricelist
  } catch (error) {
    console.log('error', error)
  }
}



module.exports = {
  articles,
  articles_original,
  photos,
  detail,
  category
}