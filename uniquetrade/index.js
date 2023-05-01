const {db} = require('../postgresql')
const tree = require('../postgresql/resolvers/tree')
const {token_data} = require('./config')
const {prepareParts, timeout, checkExpiration, getData, exportResults} = require('../utils')
const {authErrors} = require('../consts')
const request = require('request')
const {category} = require('../mysql/actions')
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
    throw error
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
    return response
  } catch (error) {
    throw error
  }
}

const updateToken = async () => {
  //refresh token
  const uniq_trade_token = await refresh_token()

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

  let isValid;
  
  if (authKey?.expiration_date) {
    isValid = checkExpiration(authKey?.expiration_date)
  }
  
  if (!isValid) {
    //update token
    return await updateToken()
  }
  const token = `Bearer ${authKey.uniq_trade_token}`
  const message = await checkJWT(token)
  
  if (authErrors.includes(message)) {
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
          reject(error)
        };
        const res = JSON.parse(response.body)
        resolve(res);
      });
    });

    return response?.brands
  } catch (error) {
    if (authErrors.includes(error?.response?.data?.message)) {
      const token = await updateToken()
      return getParams(token)
    } else {
      throw error
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
      const token = await updateToken()
      return requestPriceList(brands, token)
    } else {
      throw error
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
    if (pricelist.status === 'in queue') {
      await timeout(6000)
      getPriceLists(id, token)
    }
    if (pricelist.status === 'complete') {
      return pricelist.token
    }

  } catch (error) {
    if (authErrors.includes(error?.response?.data?.message)) {
      const token = await updateToken()
      return getPriceLists(id, token)
    } else {
      throw error
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
      const token = await updateToken()
      return await getPriceList(id, token)
    } else {
      throw error
    }
  }
}

const main = async () => {
  try {
    await timeout(18000)
    // console.log('init main')
    //get params
    const brands = await getParams()
    if (!brands) throw new Error('Произошла ошибка получения брендов')
    const brand = brands?.map(b => b.id)
    // console.log('brands')
    //request for price list
    const id = await requestPriceList(brand)
    if (!id) throw new Error('Произошла ошибка в запросе на прайс лист')
    // console.log('requestPriceList')
    //get token of price list
    await timeout(18000)
    const token = await getPriceLists(id)
    if (!token) throw new Error('Произошла ошибка в получении токена прайс листа')
    // console.log('getPriceLists', token)
    // git price list
    const pricelist = await getPriceList(token)
    // const pricelist = await getData('/data/pricelist.json')
   
    if (pricelist?.length > 0) {
       //prepare price list with categories
      const pricel = await category(pricelist)
      if (!Boolean(pricel.length)) throw new Error('Произошла ошибка в подготовке категорий')
      const price = prepareParts(pricel)

      const res = await db.Part.destroy({where: {}})
      // await exportResults(price, '/data/arr.json')
      for (let i = 0; i < price.length; i++) {
        await db.Part.create(price[i])
      }
      
      for (const brand of brands) {
        await db.Brands.findOrCreate({
          where: {name: brand.name},
          defaults: {name: brand.name},
        });
      }

      console.log('delete table', res)
      console.log('getPriceList', pricelist?.length) 
      await timeout(18000)
      await tree.updateTree()
    } else {
      throw new Error('Произошла ошибка в получении прайс листа')
    }
  } catch (error) {
    throw error
  }
}

//for router
const check = async (query, brand, token_data) => {
  try {
    let token = token_data
    if (!token_data) {
      token = await getToken()
    }

    const options = {
      method: 'GET',
      url: `https://order24-api.utr.ua/api/search/${query}?brand=${brand}`,
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
      const token = await updateToken()
      return check(query, brand, token)
    } else {
      throw error
    }
  }
}
const search = async (query, withInfo = 0, token_data) => {
  try {
    let token = token_data
    if (!token_data) {
      token = await getToken()
    }

    const options = {
      method: 'GET',
      url: `https://order24-api.utr.ua/api/search/${query}?info=${withInfo}`,
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
      const token = await updateToken()
      return search(query, withInfo, token)
    } else {
      throw error
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
      const token = await updateToken()
      return searchList(list, token)
    } else {
      throw error
    }
  }
}

const applicability = async (id, token_data) => {
  try {
    let token = token_data
    if (!token_data) {
      token = await getToken()
    }

    const options = {
      method: 'GET',
      url: `https://order24-api.utr.ua/api/applicability/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },

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
      const token = await updateToken()
      return applicability(id, token)
    } else {
      throw error
    }
  }
}

const analogs = async (brand, article)  => {
  try {
    const token = await getToken()

    const options = {
      method: 'GET',
      url: `https://order24-api.utr.ua/api/analogs/${brand}/${article}`,
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
      await updateToken()
      return analogs(brand, article)
    } else {
      throw error
    }
  }
}


module.exports = {
  main,
  analogs,
  search,
  searchList,
  applicability,
  check
}