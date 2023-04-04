const express = require('express');
const router = express.Router();
const parts = require('./db')
const tecdoc = require('./tecdoc')

router.use('/', parts);
router.use('/', tecdoc);

module.exports = router;