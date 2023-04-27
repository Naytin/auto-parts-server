const {photos} = require('../mysql/actions')
const {WEBP_URL, margin_percentage} = require('../consts')
const {addPercent, getData} = require('./')

const brandsForTecdoc = async (brands) => {
  try {
    const tecdoc_brands = await getData('/usr/local/lsws/Example/html/node/auto-parts-server/data/brands_for_request.json', false)
    // const tecdoc_brands = await getData('/data/brands_for_request.json')
    const result = []

    for (const b of brands) {
      const res = tecdoc_brands[b]

      if (res) {
        result.push(...res)
      } else {
        result.push(b)
      }
    }

    return result;
  } catch (error) {
    console.log('brandsForTecdoc, error', error)
  }
}

const brandsFromTecdoc = async (brands) => {
  try {
    const tecdoc_brands_from = await getData('/usr/local/lsws/Example/html/node/auto-parts-server/data/brands_from_tecdoc.json',false)
    // const tecdoc_brands_from = await getData('/data/brands_from_tecdoc.json')
    const result = []

    for (const b of brands) {
      const res = tecdoc_brands_from[b]

      if (res) {
        result.push(...res)
      } else {
        result.push(b)
      }
    }
    return result;
  } catch (error) {
    console.log('brandsFromTecdoc, error', error)
  }
}
const prepareParts = async (p) => {
  try {
    const ids = p.map(part => part.article)
    const b = p.map(part => part.brand)
    const tecdoc_brands = await getData('/usr/local/lsws/Example/html/node/auto-parts-server/data/brands_for_request.json', false)
    // const tecdoc_brands = await getData('/data/brands_for_request.json')
    const brands = await brandsForTecdoc(b)
    const rows = await photos(ids, brands)
    
    //prepare parts with details
    const parts = p.map(part => {
      const brand = tecdoc_brands[part.brand] || [part.brand]
      const img = rows?.filter(i => i.DataSupplierArticleNumber.replace(/\s|\//g, '') === part.article.replace(/\s|\//g, '') && brand.includes(i.brand))
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
  prepareParts,
  brandsFromTecdoc,
  brandsForTecdoc
}