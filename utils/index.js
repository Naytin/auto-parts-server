const {IDS} = require('../consts')

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

const checkExpiration = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString);
  const oneHourAgo = new Date(date.getTime());
  oneHourAgo.setHours(date.getHours() - 1);

  return oneHourAgo > new Date();
}

const prepareParts = (parts) => {
  return parts.map(p => {
    const { 
      "Артикул": article,
      "Наименование": title,
      "Бренд": brand,
      "Валюта": currency,
      "Цена": price,
      ...rest
    } = p;

    return {
      article,
      title,
      brand,
      currency,
      price,
      remainsAll: {...rest}
    }
  })
}

module.exports = {
  prepareParts,
  filterPartByExist,
  timeout,
  checkExpiration,
  passwordGenerator
}