const express = require('express');
const router = express.Router();
const parts = require('./db')
const tecdoc = require('./tecdoc')
const uniquetrade = require('./uniquetrade')

router.use('/', parts);
router.use('/', tecdoc);
router.use('/', uniquetrade);

module.exports = router;