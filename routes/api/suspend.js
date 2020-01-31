const express = require('express');
const Joi = require('joi');
const logger = require('../../logger/logger')
const router = express.Router();

router.post('/suspend', (req, res, next) => {
    const schema = {
        student: Joi.string().email().required()
    };

    const validationResult = Joi.validate(req.body, schema);
    
    if (validationResult.error) {
        res.status(400).send(validationResult.error.details[0].message)
        return;
    }

    // Suspend student 

    res.status(204).send()
});

module.exports = router;
