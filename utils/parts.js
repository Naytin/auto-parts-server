const {photos} = require('../mysql/actions')
const {WEBP_URL, BRANDS_CHANGE, margin_percentage} = require('../consts')
const {addPercent} = require('./')
const prepareParts = async (p) => {
  try {
    const ids = p.map(part => part.article)
    const brands = p.map(part => BRANDS_CHANGE[part.brand] || part.brand)
    const rows = await photos(ids, brands)
    
    console.log('photos', rows?.length)
    //prepare parts with details
    const parts = p.map(part => {
      const brand = BRANDS_CHANGE[part.brand] || part.brand
      const img = rows?.filter(i => i.DataSupplierArticleNumber.replace(/\s|\//g, '') === part.article.replace(/\s|\//g, '') && i.brand === brand)
      const images = img?.length > 0 ? img.map(im =>  ({fullImagePath: `${WEBP_URL}/${im.FileName}`})) : []
     
      const price = Number(part.price)
      return {
        ...part.dataValues,
        brand: {name: part.brand},
        yourPrice: {amount: addPercent(price, margin_percentage)},
        images: images,
        remains: Object.entries(part.remainsAll).map(([key, value]) => ({storage: {name: key}, remain: value})),
        // articles: art,
        remain: Object.values({...part.remainsAll}).reduce((acc, cur) =>  acc + Number(cur.replace(/\s|>|</g, '')) ,0)
      }
    })

    return parts;
  } catch (error) {
    console.log('prepare parts error', error)
  }
}

module.exports = {
  prepareParts
}