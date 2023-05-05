const {photos} = require('../mysql/actions')
const {WEBP_URL, margin_percentage} = require('../consts')
const {addPercent, getData, countAvailability, filterParts} = require('./')
const {analogs} = require('../uniquetrade')

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
    throw new Error(error)
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
    throw new Error(error)
  }
}

const getAnalogs = async (parts) => {
  try {
    const result = []
    let count = 0
    for (const p of parts) {
      const {article, brand} = p

      if (count < 3) {
        const res = await analogs(brand, article)

        if (Boolean(res.length)) {
          const prepare = res.map(part => {
            const {brand, title, article, yourPrice, remains} = part
            const remain = countAvailability(part)

            return {
              brand: brand.name,
              title,
              article,
              yourPrice,
              remains,
              remain
            }
          }).filter(p => p.remain > 0)

          result.push(...prepare)

          if (res.length > 5) {
            count++
          }
        }
      }
    }
    return result;
  } catch (error) {
    throw new Error(error)
  }
}
const prepareParts = async (p) => {
  try {
    let analog = []
    if (p.length < 30) {
      analog = await getAnalogs(p)
    }
    const allParts = [...p, ...analog]
    const ids = allParts.map(part => part.article)
    const b = allParts.map(part => part.brand)
    const tecdoc_brands = await getData('/usr/local/lsws/Example/html/node/auto-parts-server/data/brands_for_request.json', false)
    // const tecdoc_brands = await getData('/data/brands_for_request.json')
    const brands = await brandsForTecdoc(b)
    const rows = await photos(ids, brands)
    
    //prepare parts with details
    const parts = p.map(part => {
      const brand = tecdoc_brands[part.brand] || [part.brand]
      const img = rows?.filter(i => i.DataSupplierArticleNumber.replace(/\s|\//g, '') === part.article.replace(/\s|\//g, '') && brand.includes(i.brand))
      const images = img?.length > 0 ? img.map(im =>  ({fullImagePath: `${WEBP_URL}/${im.FileName}`})) : []
     
      const {'Найменування': title, 'Ціна': p, ...rest} = part.remainsAll
      const price = Number(part.price || p)
      return {
        ...part.dataValues,
        title: title || part.title,
        brand: {name: part.brand},
        price: price || part.price,
        yourPrice: {amount: addPercent(price, margin_percentage)},
        images: images,
        remains: Object.entries(rest).map(([key, value]) => ({storage: {name: key}, remain: value})),
        remainsAll: rest,
        // articles: art,
        remain: Object.values({...rest}).reduce((acc, cur) =>  acc + Number(cur?.replace(/\s|>|</g, '')) ,0)
      }
    })
    //prepare analogs
    const a = analog.map(part => {
      const brand = tecdoc_brands[part.brand] || [part.brand]
      const img = rows?.filter(i => i.DataSupplierArticleNumber.replace(/\s|\//g, '') === part.article.replace(/\s|\//g, '') && brand.includes(i.brand))
      const images = img?.length > 0 ? img.map(im =>  ({fullImagePath: `${WEBP_URL}/${im.FileName}`})) : []
     
      return {
        ...part,
        title: part.title,
        brand: {name: part.brand},
        images: images,
        remainsAll: part?.remainsAll || []
      }
    })
    //filter duplicates
    const filtered = filterParts([...a, ...parts])

    return filtered;
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  prepareParts,
  brandsFromTecdoc,
  brandsForTecdoc
}