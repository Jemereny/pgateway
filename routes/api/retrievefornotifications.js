const express = require('express');
const Joi = require('joi');
const logger = require('../../logger/logger')
const router = express.Router();

router.post('/retrievefornotifications', (req, res, next) => {
    const schema = {
        teacher: Joi.string().email().required(),
        notification: Joi.string().required()
    };

    const validationResult = Joi.validate(req.body, schema);
    
    if (validationResult.error) {
        errorMessage = {
            message: validationResult.error.details
        }
        res.status(400).send(errorMessage)
        return;
    }

    // Suspend student 

    res.status(204).send()
});

module.exports = router;
