const express = require('express');
const Joi = require('joi');
const logger = require('../../logger/logger')
const router = express.Router();

const db = require('../../db/db');

router.post('/retrievefornotifications', async (req, res, next) => {
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

    const values = validationResult.value;

    const teacherEmail = values["teacher"];
    const notification = values["notification"];


    // Get list
    studentEmails = await db.retrieveNotSuspendedStudentsForNotification(teacherEmail);

    if (studentEmails === null) {
        res.status(500).send();
        return;
    }

    res.status(204).send()
});




module.exports = router;
