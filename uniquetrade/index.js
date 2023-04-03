const {instance, token_data} = require('./config')
const {db} = require('../postgresql')

const authErrors = ['JWT Token not found', 'Invalid JWT Token', 'Expired JWT Token']
const timeout = async (time) =>  await new Promise(r => setTimeout(r, time));

const refresh_token = async () => {
  try {
    const response = await instance.post('api/token/refresh', token_data)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

const checkExpiration = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString);
  const oneHourAgo = new Date(date.getTime());
  oneHourAgo.setHours(date.getHours() - 1);

  return oneHourAgo > new Date();
}

const updateToken = async () => {
  //refresh token
  console.log('refresh token');
  const uniq_trade_token = await refresh_token()
  console.log('update token', uniq_trade_token);

  const date = new Date();
  const expiration_date = new Date(date.getTime());
  expiration_date.setHours(date.getHours() + 23);
  // update db
  await db.Settings.update({uniq_trade_token: uniq_trade_token.token , expiration_date}, {where: {id: 1}});

  return `Bearer ${uniq_trade_token.token}`
}

const getToken = async () => {
  const authKey = await db.Settings.findOne({where: {id: 1}});
  if (!authKey) {
    await db.Settings.create({});
  }
  console.log('key', authKey?.expiration_date);
  console.log('key', authKey?.uniq_trade_token);
  let isValid;
  
  if (authKey?.expiration_date) {
    isValid = checkExpiration(authKey?.expiration_date)
  }
  
  console.log({isValid});
  
  if (!isValid) {
    //update token
    return await updateToken()
  }

  return `Bearer ${authKey.uniq_trade_token}`
}

const getParams = async (token_data = '')=> {
  try {
    let token = token_data
    if (!token_data) {
      token = await getToken()
    }

    instance.defaults.headers.common['Authorization'] = token;
    const {data} = await instance.get(`pricelists/export-params`)
    console.log(data?.brands)
    return data?.brands?.map(b => b.id)
  } catch (error) {
    console.log(error)
    if (authErrors.includes(error?.response?.data?.message)) {
      console.log(error?.response?.data);
      const token = await updateToken()
      return getParams(token)
    } else {
      console.log('Произошла ошибка:', error.message);
      console.log('Произошла ошибка data:', error?.response?.data);
    }
  }
}

const requestPriceList = async (brands = [], token_data = '')=> {
  try {
    let token = token_data
    if (!token_data) {
      token = await getToken()
    }

    instance.defaults.headers.common['Authorization'] = token;
    const {data} = await instance.post(`pricelists/export-request`, {
      "brandsId": brands,
      "format":"json",
      "utrArticle":false,
      "inStock":true
    })
    
    return data.id
  } catch (error) {
    if (authErrors.includes(error?.response?.data?.message)) {
      console.log(error?.response?.data);
      const token = await updateToken()
      return requestPriceList(brands, token)
    } else {
      console.log('Произошла ошибка:', error.message);
      console.log('Произошла ошибка data:', error?.response?.data);
    }
  }
}

const getPriceLists = async (id = '', token_data = '')=> {
  try {
    let token = token_data
    if (!token_data) {
      token = await getToken()
    }

    instance.defaults.headers.common['Authorization'] = token;
    const {data} = await instance.get(`pricelists`)
    console.log(data)
    const pricelist = data.find(p => p.id === id)
    console.log('1', pricelist)
    if (pricelist.status === 'in queue') {
      await timeout(6000)
      getPriceLists(id, token)
    }
    if (pricelist.status === 'complete') {
      return pricelist.token
    }

  } catch (error) {
    if (authErrors.includes(error?.response?.data?.message)) {
      console.log(error?.response?.data);
      const token = await updateToken()
      return getPriceLists(id, token)
    } else {
      console.log('Произошла ошибка:', error.message);
      console.log('Произошла ошибка data:', error?.response?.data);
    }
  }
}

const getPriceList = async (id = '', token_data = '')=> {
  try {
    let token = token_data
    if (!token_data) {
      token = await getToken()
    }

    instance.defaults.headers.common['Authorization'] = token;
    const {data} = await instance.get(`pricelists/export/${id}`)

    return data
  } catch (error) {
    if (authErrors.includes(error?.response?.data?.message)) {
      console.log(error?.response?.data);
      const token = await updateToken()
      return await getPriceList(id, token)
    } else {
      console.log('Произошла ошибка:', error.message);
      console.log('Произошла ошибка data:', error?.response?.data);
    }
  }
}

const main = async () => {
  try {
    // await timeout(18000)
    console.log('init main')
    //get params
    // const brands = await getParams()
    // if (!brands) throw new Error('Произошла ошибка получения брендов')
    console.log('brands')
    //request for price list
    // const id = await requestPriceList(brands)
    // if (!id) throw new Error('Произошла ошибка в запросе на прайс лист')
    console.log('requestPriceList')
    //get token of price list
    // await timeout(18000)
    const token = await getPriceLists(649344)
    // if (!token) throw new Error('Произошла ошибка в получении токена прайс листа')
    console.log('getPriceLists', token)
    //git price list
    const pricelist = await getPriceList(token)
    console.log('getPriceList', pricelist?.length)

    if (pricelist?.length > 0) {
      const res = await db.Part.destroy({where: {}})
      
      for (let i = 0; i < pricelist.length; i++) {
        await db.Part.create(pricelist[i])
      }
      console.log('delete table', res)
    } else {
      throw new Error('Произошла ошибка в получении прас листа')
    }
  } catch (error) {
    throw error
  }
}

module.exports = main