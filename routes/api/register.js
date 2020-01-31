const express = require('express');
const Joi = require('joi');
const logger = require('../../logger/logger')
const router = express.Router();

router.post('/register', (req, res, next) => {
    const schema = {
        teacher: Joi.string().email().required(),
        students: Joi.array().items(Joi.string().email().required()).required()
    };

    const validationResult = Joi.validate(req.body, schema);
    
    if (validationResult.error) {
        res.status(400).send(validationResult.error.details[0].message)
        return;
    }

    res.status(204).send()
});

module.exports = router;
