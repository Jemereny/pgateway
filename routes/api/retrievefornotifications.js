const express = require('express');
const Joi = require('joi');
const logger = require('../../logger/logger')
const router = express.Router();

const db = require('../../db/db');

function getStudentsInNotification (message) {
    /**
     * Parses the students that are mentioned in the notification
     */

    mentionedStudents = []

    while(true) {
        // Super simple regex parsing
        // Match @ then the rest of the email until a space
        const match = message.match("@\\S+@\\S+");

        if (match === null) {
            break;
        }

        // Remove all occurances from string
        message = message.replace(new RegExp(match[0], 'g'), '');
        mentionedStudents.push(match[0].substring(1, match[0].length));
    }

    return mentionedStudents;
}

async function getNotSuspendedMentionedStudents(notification) {
    /**
     * Returns the list of students that are mentioned and not suspended
     */
    return new Promise(async (resolve, reject) => {
        const mentionedStudents = getStudentsInNotification(notification);
        const suspendedStudents = await db.retrieveAllSuspendedStudents()

        if (suspendedStudents === null) {
            logger.log("getNotSuspendedMentionedStudents:");
            reject(null);
        }

        const notSuspendedStudents = []
        mentionedStudents.forEach(student => {
            if (!suspendedStudents.includes(student)) {
                notSuspendedStudents.push(student);
            }
        })

        resolve(notSuspendedStudents);
    })
}

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

    // Get student who are mentioned and not suspended
    const notSuspendedMentionedStudentsPromise = getNotSuspendedMentionedStudents(notification)
    .catch(err => {
        res.status(500).send();
        return;
    });

    // Get students who are under the teacher and is not suspended
    const studentEmailsPromise = db.retrieveNotSuspendedStudentsForNotification(teacherEmail);

    await Promise.all([notSuspendedMentionedStudentsPromise, studentEmailsPromise])
    .then(values => {
        notSuspendedMentionedStudents = values[0];
        studentEmails = values[1];

        if (studentEmails === null) {
            res.status(500).send();
            return;
        }

        allRecipients = [...notSuspendedMentionedStudents, ...studentEmails];

        res.status(200).send({
            recipients: allRecipients
        })
    });
    
})

module.exports = router;
