const express = require('express');
const logger = require('../logger/logger')
const router = express.Router();

router.get('/', (req, res, next) => {
    res.send("Hello World!")
    logger.log("Hello world")
});

module.exports = router;
