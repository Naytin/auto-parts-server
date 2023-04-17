const pool = require('./')

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



module.exports = {
  articles,
  articles_original,
  photos,
  detail
}