const express = require('express');
const Joi = require('joi');
const logger = require('../../logger/logger');
const router = express.Router();

const db = require("../../db/db");

router.post('/register', async (req, res, next) => {
    const schema = {
        teacher: Joi.string().email().required(),
        students: Joi.array().items(Joi.string().email().required()).required()
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
    const teacher = values.teacher;
    const students = values.students;
    
    const success = await db.registerTeacherStudents(teacher, students);
    if (success) {
        res.status(204).send()
    } else {
        res.status(500).send()
    }
});

module.exports = router;
