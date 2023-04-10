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

const photos = async (ids) => {
  try {
    const questionMarks = ids.map(() => "?").join(",");
    const [rows] = await pool.execute(`SELECT FileName,supplierId,DataSupplierArticleNumber
      FROM article_images 
      WHERE DataSupplierArticleNumber IN (${questionMarks})`, [...ids]);

    return rows;
  } catch (error) {
    
  }
}


module.exports = {
  articles,
  articles_original,
  photos
}