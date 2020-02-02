const express = require('express');
const Joi = require('joi');
const logger = require('../../logger/logger');
const router = express.Router();

const db = require('../../db/db');

router.post('/suspend', async (req, res, next) => {
    const schema = {
        student: Joi.string().email().required()
    };

    const validationResult = Joi.validate(req.body, schema);
    
    if (validationResult.error) {
        errorMessage = {
            message: validationResult.error.details
        }
        res.status(400).send(errorMessage)
        return;
    }

    studentEmail = validationResult.value["student"]

    // Suspend student
    const has_succeeded = await db.suspendStudent(studentEmail);

    if (!has_succeeded) {
        res.status(200).send("User does not exist");
        return;
    }

    res.status(204).send()
});

module.exports = router;
