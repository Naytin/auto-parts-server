const {db} = require('../postgresql')
const request = require('request')
const authErrors = ['JWT Token not found', 'Invalid JWT Token', 'Expired JWT Token', 'Unauthorized']
const timeout = async (time) =>  await new Promise(r => setTimeout(r, time));

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
const token_id = {
  "refresh_token": "a7d9f33162704f4bce54d38a2ca27fbe699e459fefdf83b3858165101340f68a692d9806f27f7f280f5c8ff8da4d165e14012ce7c4d604406c5d533fc9f8f85e",
  "browser_fingerprint": "cb6a784884cef585b514a76f3509118a"
}
const token_data = JSON.stringify(token_id);

const checkJWT = async (token) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://order24-api.utr.ua/pricelists',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    const response = await new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) reject(error);
        resolve(response?.statusMessage);
      });
    });

    return response
  } catch (error) {
    
  }
}

const refresh_token = async () => {
  try {
    const options = {
      method: 'POST',
      url: 'https://order24-api.utr.ua/api/token/refresh',
      headers: {
        'Content-Type': 'application/json'
      },
      body: token_data
    };

    const response = await new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) reject(error);
        const res = JSON.parse(response.body)
        resolve(res);
      });
    });
    console.log()
    return response
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
    await db.Settings.create();
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
  const token = `Bearer ${authKey.uniq_trade_token}`
  const message = await checkJWT(token)
  
  if (authErrors.includes(message)) {
    console.log('jwt not valid', message)
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

    const options = {
      method: 'GET',
      url: 'https://order24-api.utr.ua/pricelists/export-params',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    const response = await new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) {
          console.log('reject response brands')
          reject(error)
        };
        console.log(response?.statusCode)
        console.log(response?.statusMessage)
        const res = JSON.parse(response.body)
        resolve(res);
      });
    });

    console.log(response?.brands)
    return response?.brands?.map(b => b.id)
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

    const options = {
      method: 'POST',
      url: 'https://order24-api.utr.ua/pricelists/export-request',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        "brandsId": brands,
        "format":"json",
        "utrArticle":false,
        "inStock":true
      })
    };

    const response = await new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) reject(error);
        const res = JSON.parse(response.body)
        resolve(res);
      });
    });
    
    return response.id
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

    const options = {
      method: 'GET',
      url: 'https://order24-api.utr.ua/pricelists',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    const response = await new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) reject(error);
        const res = JSON.parse(response.body)
        resolve(res);
      });
    });

    const pricelist = response.find(p => p.id === id)
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

    const options = {
      method: 'GET',
      url: `https://order24-api.utr.ua/pricelists/export/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    const response = await new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) reject(error);
        const res = JSON.parse(response.body)
        resolve(res);
      });
    });

    return response
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
    await timeout(18000)
    console.log('init main')
    //get params
    const brands = await getParams()
    if (!brands) throw new Error('Произошла ошибка получения брендов')
    console.log('brands')
    //request for price list
    const id = await requestPriceList(brands)
    if (!id) throw new Error('Произошла ошибка в запросе на прайс лист')
    console.log('requestPriceList')
    //get token of price list
    await timeout(18000)
    const token = await getPriceLists(id)
    if (!token) throw new Error('Произошла ошибка в получении токена прайс листа')
    console.log('getPriceLists', token)
    // git price list
    const pricelist = await getPriceList(token)

    if (pricelist?.length > 0) {
      const res = await db.Part.destroy({where: {}})
      const price = prepareParts(pricelist)

      for (let i = 0; i < price.length; i++) {
        await db.Part.create(price[i])
      }
      console.log('delete table', res)
      console.log('getPriceList', pricelist?.length) 
    } else {
      throw new Error('Произошла ошибка в получении прайс листа')
    }
  } catch (error) {
    throw error
  }
}

//for router
const search = async (query, withInfo = 0, token_data) => {
  try {
    let token = token_data
    if (!token_data) {
      token = await getToken()
    }

    const options = {
      method: 'GET',
      url: `search/${query}?info=${withInfo}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    const response = await new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) reject(error);
        const res = JSON.parse(response.body)
        resolve(res);
      });
    });
    
    return response
  } catch (error) {
    if (authErrors.includes(error?.response?.data?.message)) {
      console.log(error?.response?.data);
      const token = await updateToken()
      return search(query, withInfo, token)
    } else {
      console.log('Произошла ошибка:', error.message);
      console.log('Произошла ошибка data:', error?.response?.data);
    }
  }
}
const searchList = async (list, token_data) => {
  try {
    let token = token_data
    if (!token_data) {
      token = await getToken()
    }

    var data = JSON.stringify({"details": list})

    const options = {
      method: 'POST',
      url: 'https://order24-api.utr.ua/api/search',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: data
    };

    const response = await new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) reject(error);
        const res = JSON.parse(response.body)
        resolve(res);
      });
    });

    return response
  } catch (error) {
    if (authErrors.includes(error?.response?.data?.message)) {
      console.log(error?.response?.data);
      const token = await updateToken()
      return searchList(list, token)
    } else {
      console.log('Произошла ошибка:', error.message);
      console.log('Произошла ошибка data:', error?.response?.data);
    }
  }
}

const analogs = async (brand, article)  => {
  try {
    const token = await getToken()

    const options = {
      method: 'GET',
      url: `analogs/${brand}/${article}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    const response = await new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) reject(error);
        const res = JSON.parse(response.body)
        resolve(res);
      });
    });
  
    return response
  } catch (error) {
    if (authErrors.includes(error?.response?.data?.message)) {
      console.log(error?.response?.data);
      await updateToken()
      return analogs(brand, article)
    } else {
      console.log('Произошла ошибка:', error.message);
      console.log('Произошла ошибка data:', error?.response?.data);
    }
  }
}


module.exports = {
  main,
  analogs,
  search,
  searchList
}