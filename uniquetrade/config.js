const axios = require('axios')

const token_data = JSON.stringify({
  "refresh_token": "a7d9f33162704f4bce54d38a2ca27fbe699e459fefdf83b3858165101340f68a692d9806f27f7f280f5c8ff8da4d165e14012ce7c4d604406c5d533fc9f8f85e",
  "browser_fingerprint": "cb6a784884cef585b514a76f3509118a"
});

const instance = axios.create({
  baseURL: 'https://order24-api.utr.ua/',
  timeout: 3000,
  maxBodyLength: Infinity,
  headers: { 
    'Content-Type': 'application/json'
  },
});

module.exports = {
  instance,
  token_data
};