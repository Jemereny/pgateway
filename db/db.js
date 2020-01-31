const logger = require('../logger/logger')
const mysql = require('mysql')

TEACHER_TABLE = "teachers"
STUDENT_TABLE = "students"
NOFITICATION_TABLE = "notifications"

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

function createTeacher(teacherEmail) {
    /**
     * This function is to create a teacher
     * We have this function so that the "teachers" table is populated, so as to mock
     * a real db
     */
    let query = `INSERT INTO ${TEACHER_TABLE} (email) VALUES ('${teacherEmail}')`
    connection.query(query, (err,rows) => {
        if (err) {
            logger.log(err);
            throw err;
        }
    })
}

function createStudent(studentEmail) {
    /**
     * This function is to create a student
     * We have this function so that the "student" table is populated, so as to mock
     * a real db
     */
    let query = `INSERT INTO ${STUDENT_TABLE} (email) VALUES ('${studentEmail}')`
    connection.query(query, (err,rows) => {
        if (err) {
            logger.log(err);
            throw err;
        }
    })
}

async function doesTeacherExist(teacherEmail, callback) {
    let query = `SELECT email FROM ${TEACHER_TABLE} WHERE email='${teacherEmail}'`;
    logger.log(query);
    var result = connection.query(query, (err, rows) => {
        if (err) {
            logger.log(err);
            throw err;
        }

        if (rows.length == 0) {
            return callback(false);
        } else {
            return callback(true);
        }
    });
}

async function doesStudentExist(studentEmail, callback) {
    let query = `SELECT email FROM ${STUDENT_TABLE} WHERE email='${studentEmail}'`
    var result = connection.query(query, (err, rows) => {
        if (err) {
            logger.log(err);
            throw err;
        }

        if (rows.length == 0) {
            return callback(false);
        } else {
            return callback(true);
        }
    });
}

async function registerTeacherStudent(teacherEmail, studentEmail) {
    // Create entries if teacher/student does not exist
    await doesTeacherExist(teacherEmail, (doesExist) => {
        if (!doesExist) {
            createTeacher(teacherEmail)
        }
    });

    await doesStudentExist(studentEmail, (doesExist) => {
        if (!doesExist) {
            createStudent(studentEmail)
        }
    })
}

registerTeacherStudent("teacher@gmail.com", "student")

module.exports = {
    registerTeacherStudent: registerTeacherStudent
};
