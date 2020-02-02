const express = require('express');
const Joi = require('joi');
const logger = require('../../logger/logger');
const router = express.Router();

const db = require("../../db/db");

router.get('/commonstudents', async (req, res, next) => {

    const singleSchema = {
        teacher: Joi.string().email().required()
    };
    
    const multipleSchema = {
        teacher: Joi.array().items(Joi.string().email()).required()
    };

    const singleValidationResult = Joi.validate(req.query, singleSchema)
    const multipleValidationResult = Joi.validate(req.query, multipleSchema);
    
    if (singleValidationResult.error && multipleValidationResult.error) {
        errorMessage = {
            message: singleValidationResult.error.details
        }
        res.status(400).send(errorMessage)
        return;
    }

    let teachers;
    if (singleValidationResult.error) {
        teachers = multipleValidationResult.value["teacher"]
    } else {
        teachers = [singleValidationResult.value["teacher"]]
    }

    // Retrieve data
    const studentEmails = await db.retrieveCommonStudentsFromTeachers(teachers)

    if (studentEmails == null) {
        res.status(500).send();
        return;
    }

    students = {
        students :studentEmails
    }

    res.status(200).send(students)
});

module.exports = router;
