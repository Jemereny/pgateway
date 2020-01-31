const express = require('express');
const Joi = require('joi');
const logger = require('../../logger/logger')
const router = express.Router();

router.get('/commonstudents', (req, res, next) => {

    const schema = {
        teacher: Joi.array().items(Joi.string().email()).required()
    }

    const validationResult = Joi.validate(req.query, schema);
    
    if (validationResult.error) {
        res.status(400).send(validationResult.error.details)
        return;
    }

    // Retrieve data

    students = {
        students :[]
    }

    res.status(200).send(students)
});

module.exports = router;
