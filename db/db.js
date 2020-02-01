const logger = require('../logger/logger');
const mysql = require('mysql');

TEACHER_TABLE = "teachers"
STUDENT_TABLE = "students"
NOTIFICATION_TABLE = "notifications"

const connection = mysql.createConnection({
    host: "127.0.0.1",
    // host: 'mysql',
    user: 'root',
    password: 'password',
    database: 'govtech'
});

connection.connect((err) => {
    if (err) {
        logger.log(err);
        throw err;
    }

    logger.log('mySql connected...')
});

function createUserInTable(email, table) {
    /**
     * This function is to create a user
     * We have this function so that the table is populated, to mock a real db
     */
    let query = `INSERT INTO ${table} (email) VALUES ('${email}')`
    return new Promise((resolve, reject) => {
            connection.query(query, (err,rows) => {
            if (err) {
                logger.log(err);
                reject (err);
            }

            resolve(true);
        });
    });
}

function createUserInTableIfNotExist(email, table) {
    /**
     * Creates a user if a user does not exist in the table
     */
    let query = `SELECT email FROM ${table} WHERE email='${email}'`;
    return new Promise((resolve, reject) => {
        connection.query(query, (err, rows) => {
            if (err) {
                logger.log(err);
                reject(err);
            }
            logger.log(`Creating user: ${email}`)
            if (rows.length == 0) {
                createUserInTable(email, table).then(isCreated => {
                    // Resolve promise only if teacher exists
                    resolve(true);
                });
            } else {
                // Teacher already exists
                resolve(true);
            }
        });
    });
}

function addNotificationTeacherStudent(teacherEmail, studentEmail) {
    const query = `INSERT INTO ${NOTIFICATION_TABLE} (teacher_email_id, student_email_id) 
    VALUES ((SELECT id FROM ${TEACHER_TABLE} where email='${teacherEmail}'), 
    (SELECT id FROM ${STUDENT_TABLE} where email='${studentEmail}'))`;
    return new Promise((resolve, reject) => {
        connection.query(query, (err, rows) => {
            if (err) {
                logger.log(err);
                reject(err);
            }
            console.log("HERE")
            resolve(true);
        });
    })
}

function registerTeacherStudent(teacherEmail, studentEmail) {
    // Create entries if teacher/student does not exist
    createUserInTableIfNotExist(teacherEmail, TEACHER_TABLE)
    .then(() => {return createUserInTableIfNotExist(studentEmail, STUDENT_TABLE);})
    .then(() => {return addNotificationTeacherStudent(teacherEmail, studentEmail);})
    .catch(err => logger.log(err));
}

module.exports = {
    registerTeacherStudent: registerTeacherStudent
};
