
const IDS = [21,35]
const authErrors = ['JWT Token not found', 'Invalid JWT Token', 'Expired JWT Token', 'Unauthorized']
const IMAGE_URL = 'https://auto-db.pro/tecdoc/images'
const WEBP_URL = 'https://arenda.mytecdoc.com/tmp/images'
const BRANDS_CHANGE = {
  "FEBI": "FEBI BILSTEIN",
  "BOSCH АКБ": "BOSCH"
}

const TECDOC_BRANDS = {
  "ZF Parts": ["ZF"],
  "CALORSTAT by Vernet": ["VERNET"],
  "TRUCKTEC AUTOMOTIVE": ["TRUCKTEC", "TRUCKTEC AUTOMOTIVE"],
  "TEDGUM": ["TED-GUM", "TEDGUM", "TED GUM"],
  "Saleri SIL": ["SALERI", "SIL", "Saleri SIL"],
  "QUINTON HAZELL": ["QH"],
  "POLMO": ["POLMOSTROW"],
  "PE Automotive": ["PETERS"],
  "PARTS-MALL": ["DONGIL", "CAR-DEX", "PARTS-MALL", "PMC", "ADDAX-Q"],
  "NÜRAL": ["NURAL"],
  "MEAT & DORIA": ["MEAT&DORIA"],
  "LYNXauto": ["LYNX"],
  "LUCAS ELECTRICAL": ["LUCAS"],
  "LUCAS DIESEL": ["LUCAS"],
  "LEMFÖRDER": ["LEMFORDER"],
  "KYB": ["K-FLEX", "KYB", "KAYABA"],
  "ORIGINAL IMPERIUM": ["IMPERGOM"],
  "HSB GOLD": ["HSB"],
  "HENGST FILTER": ["HENGST"],
  "LÖBRO": ["LOBRO"],
  "CoopersFiaam": ["COOPERSFIAAM", "COOPERS", "FIAAM"],
  "FA1": ["FISCHER", "FA1", "FISCHER AUTOMOTIVE ONE"],
  "E.T.F.": ["ETF"],
  "DT Spare Parts": ["DT"],
  "CS Germany": ["CS"],
  "CONTITECH": ["CONTITECH", "CONTI"],
  "HC-Cargo": ["CARGO"],
  "BOSCH DIAGNOSTICS": ["BOSCH", "BOSCH SERVICE", "BOSCH АКБ"],
  "BOSCH": ["BOSCH", "BOSCH SERVICE", "BOSCH АКБ"],
  "BEHR HELLA SERVICE": ["BEHR-HELLA", "BEHR", "BEHR (HELLA)", "HELLA PAGID", "HELLA"],
  "BEHR": ["BEHR", "BEHR (HELLA)", "HELLA PAGID", "HELLA"],
  "AL-KO": ["ALKO"],
  "AVA QUALITY COOLING": ["AVA", "AVA COOLING"],
  "AUTOMEGA": ["AUTOMEGA", "AUTOMEGA - DELLO", "DELLO"],
  "AUTOFREN SEINSA": ["AUTOFREN", "SEINSA", "AUTOFREN SEINSA"],
  "JS ASAKASHI": ["ASAKASHI"],
  "AS METAL": ["ASMETAL"],
  "ALCO FILTER": ["ALCO", "ALCO FILTERS"],
  "AMC": ["AMC"],
  "AMC Filter": ["AMC"],
  "BF": ["BF GERMANY"],
  "SNR": ["NTN-SNR", "SNR", "NTN"],
  "VALEO": ["VALEO", "VALEO PHC"],
  "FEBI BILSTEIN": ["FEBI BILSTEIN", "FEBI"]
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
  margin_percentage,
  TECDOC_BRANDS
}