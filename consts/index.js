
const IDS = [21,35]
const authErrors = ['JWT Token not found', 'Invalid JWT Token', 'Expired JWT Token', 'Unauthorized']
const IMAGE_URL = 'https://auto-db.pro/tecdoc/images'
const WEBP_URL = 'https://arenda.mytecdoc.com/tmp/images'
const BRANDS_CHANGE = {
  "FEBI": "FEBI BILSTEIN",
  "BOSCH АКБ": "BOSCH"
}

const CATEGORY_UNIQUETRADE = ['олива', 'лампи','Акумулятори', 'Акумуляторна батарея', 'олива моторна', 'колодки']
const margin_percentage = 19.41324
const UNIQUETRADE = {
  engine_oil: 'https://order24-api.utr.ua/catalog/akeneo/productsByPagination?type=engine_oil&page=1&limit=1000&categories=10',
  trans_oil: 'https://order24-api.utr.ua/catalog/akeneo/productsByPagination?type=gear_oil&page=1&limit=20&categories=11',
  akb: 'https://order24-api.utr.ua/catalog/akeneo/productsByPagination?type=batteries&page=1&limit=1000&categories=4'
}

module.exports = {
  IDS,
  authErrors,
  IMAGE_URL,
  WEBP_URL,
  BRANDS_CHANGE,
  margin_percentage
}