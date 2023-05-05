const {IDS} = require('../consts')
const fs = require('fs')
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

// function for export to json file
const exportResults = async (parsedResults, outputFile = 'data.json') => {
  const jsonContent = JSON.stringify(parsedResults, null, 4);
  fs.writeFileSync(appDir.replace('/cron', '') + outputFile, jsonContent);
}

const getData = async (data, root = true) => {
  let response;
  if (root) {
    response = fs.readFileSync(appDir.replace('/cron', '') + data,'utf8')
  } else {
    response = fs.readFileSync(data,'utf8')
  }
  
  return JSON.parse(response)
}

const timeout = async (time) =>  await new Promise(r => setTimeout(r, time));
const filterPartByExist = (part) => {
  //makes filter by remains, it means availability product
  if (part.remains && part.remains.length > 0) {
    const toOrder = Boolean(part.remains?.find(r => IDS.includes(r?.storage?.id)))
    const availability = Boolean(part.remains?.find(r => !IDS.includes(r?.storage?.id)))

    let {id,brand,article,title,yourPrice,images, remains, remainsAll} = part
    images = images?.map(img => ({fullImagePath: img.fullImagePath})).filter((_,i) => i === 0) || []

    return {id,brand,article,title,yourPrice,images, availability, toOrder,remainsAll: remainsAll || [], remains}
  } else {
    let {id,brand,article,title,yourPrice,images, remainsAll, remains} = part
    images = images?.map((img) => ({fullImagePath: img.fullImagePath})).filter((_,i) => i === 0) || []
    const toOrder = Boolean(part.remainsAll?.find(r => IDS.includes(r?.storage?.id)))
    const availability = Boolean(part.remainsAll?.find(r => !IDS.includes(r?.storage?.id) && Number(r.remain) !== 0))
    
    return {id,brand,article,title, yourPrice, images, availability, toOrder, remainsAll: remainsAll || [], remains}
  }
}

const passwordGenerator = () => {
  let letters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";

  for (let i = 0; i < 8; i++) {
    let generate = letters[Math.floor(Math.random() * 36)];
    password += generate;
  }

  return password
}
const addPercent = (sum, PERCENT) => {
  if (!sum) return 0
  
  return Number((((PERCENT / 100) * sum) + sum).toFixed(2))
}

const checkExpiration = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString);
  const oneHourAgo = new Date(date.getTime());
  oneHourAgo.setHours(date.getHours() - 1);

  return oneHourAgo > new Date();
}

const preparePartsForDB = async (parts, node) => {
  try {
    for (const [index, part] of parts.entries()) {
      const n = node.filter(n => n.productid === part.productid && n.supplierid === part.supplierid)
      const categories = n.map(cat => cat.nodeid)

      if (Boolean(n.length)) {
        parts[index] = {...part, category: Array.from(new Set(categories))}
      } else {
        parts[index] = {...part, category: []}
      }
    }

    return parts;
  } catch (error) {
    console.log('preparePart error', error)
  }
}

const filterParts = (parts) => {
  try {
    const filtered =  parts.reduce((acc,cur) => {
      acc[`${cur.article.replace(/\s|\//g, '')}-${cur.brand.name}`] = cur
      return acc
    },{})

    return Object.values(filtered)
  } catch (error) {
    throw new Error(error)
  }
}

const countAvailability = (part) => {
  try {
    if (!part.remains || part.remains?.length < 1) return 0

    return part.remains?.reduce((acc,cur) => {
      const n = cur.remain.replace(/\s|>|</g, '');
      return acc + Number(n)
    },0)
  } catch (error) {
    throw new Error(error)
  }
}

const prepareParts = (parts) => {
  return parts.map(p => {
    // const { 
    //   "Артикул": article,
    //   "Наименование": title,
    //   "Бренд": brand,
    //   "Валюта": currency,
    //   "Цена": price,
    //   ...rest
    // } = p;
    const { 
      "Артикул": article,
      "Найменування": title,
      "Бренд": brand,
      "Валюта": currency,
      "Ціна": price,
      datasupplierarticlenumber,
      supplierid,
      description,
      productid,
      category,
      ...rest
    } = p;

    return {
      article,
      article_search: article.replace(/\s|\//g, ''),
      title,
      brand,
      currency,
      price,
      tArticle: datasupplierarticlenumber,
      supplierid,
      productid,
      tBrand: description,
      category,
      remainsAll: {...rest}
    }
  })
}

module.exports = {
  prepareParts,
  filterPartByExist,
  timeout,
  checkExpiration,
  passwordGenerator,
  addPercent,
  preparePartsForDB,
  getData,
  exportResults,
  filterParts,
  countAvailability
}