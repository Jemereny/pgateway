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
        logger.log("connection.connect: " + err);
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
                logger.log("createUserInTable: " +err);
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
                logger.log("createUserInTableIfNotExist: " + err);
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
    /**
     * Adding to the notification table - teacher to student
     */
    const query = `
            INSERT INTO ${NOTIFICATION_TABLE} (teacher_email_id, student_email_id) 
            VALUES ((SELECT id FROM ${TEACHER_TABLE} where email='${teacherEmail}'), 
            (SELECT id FROM ${STUDENT_TABLE} where email='${studentEmail}'))
            `;

    return new Promise((resolve, reject) => {
        connection.query(query, (err, rows) => {
            if (err) {
                logger.log("addNotificationTeacherStudent: " + err)
                reject(err);
            }
            logger.log(`Notification added: ${teacherEmail} - ${studentEmail}`);
            resolve(true);
        });
    })
}

function registerTeacherStudent(teacherEmail, studentEmail) {
    // Create entries if teacher/student does not exist
    createUserInTableIfNotExist(teacherEmail, TEACHER_TABLE)
    .then(() => {return createUserInTableIfNotExist(studentEmail, STUDENT_TABLE);})
    .then(() => {return addNotificationTeacherStudent(teacherEmail, studentEmail);})
    .catch(err => {return false;});

    return true;
}

async function registerTeacherStudents(teacherEmail, studentEmails) {

    // Create entries if teacher/student does not exist
    let createTeacherPromise = createUserInTableIfNotExist(teacherEmail, TEACHER_TABLE);
    let createStudentPromises = [];
    studentEmails.forEach(studentEmail => createStudentPromises.push(createUserInTableIfNotExist(studentEmail, STUDENT_TABLE)));

    // Wait for all students to be created
    await Promise.all([createTeacherPromise, ...createStudentPromises]).catch(err => {return false;});

    // Set notifications
    let addNotificationPromises = [];
    studentEmails.forEach(studentEmail => addNotificationPromises.push(addNotificationTeacherStudent(teacherEmail, studentEmail)));

    await Promise.all(addNotificationPromises).catch(err => {return false;});

    return true;
}

async function getCommonStudentsFromTeachers(teacherEmails) {
    let getEmailIdQuery = `
    SELECT DISTINCT student_email_id
    FROM ${NOTIFICATION_TABLE} as a
    WHERE (1=1)
    `
    teacherEmails.forEach((teacherEmail) => {
        // For each teacher, sub query it to obtain the intersection
        let subquery = `
        AND a.student_email_id in (
            SELECT student_email_id
            from ${NOTIFICATION_TABLE}
            WHERE teacher_email_id = `

        subquery += `(SELECT id FROM ${TEACHER_TABLE} where email='${teacherEmail}')`;
        subquery += `)`;

        // Add to query
        getEmailIdQuery += subquery;
    })

    // Query to get the students emails instead of id
    let query = `
    SELECT email 
    FROM ${STUDENT_TABLE}
    RIGHT JOIN (${getEmailIdQuery}) b
    ON ${STUDENT_TABLE}.id = b.student_email_id`;

    return new Promise((resolve,reject) => {
        connection.query(query, (err, rows) => {
            if (err) {
                logger.log("retrieveCommonStudentsFromTeacher: " + err);
                reject(err);
            }

            const studentEmails = []
            rows.forEach(row => studentEmails.push(row["email"]));
            
            resolve(studentEmails);
        });
    });
}

async function retrieveCommonStudentsFromTeachers(teacherEmails) {
    const studentEmails = await getCommonStudentsFromTeachers(teacherEmails)
    .catch(err => {
            logger.log(err);
            return null;
        });

    return studentEmails;
}

async function updateSuspendStudent(studentEmail, is_suspended) {
    const query = `
    UPDATE ${STUDENT_TABLE}
    SET is_suspended = ${is_suspended}
    WHERE email='${studentEmail}'`;

    console.log(query);

    return new Promise((resolve, reject) => {
        connection.query(query, (err, rows) => {
            if (err) {
                logger.log("updateSuspendStudent: " + err);
                reject(err);
            }

            const affectedRows = rows["affectedRows"];

            // Can only be 0 or 1, if 0, means none affected
            if (affectedRows == 0) {
                resolve(false);
            }

            resolve(true);
        });
    })
}

async function suspendStudent(studentEmail) {
    const has_succeeded = await updateSuspendStudent(studentEmail, true)
    .catch(err => 
        {
            logger.log(err);
            return null;
        });

    return has_succeeded;
}

module.exports = {
    registerTeacherStudents: registerTeacherStudents,
    retrieveCommonStudentsFromTeachers: retrieveCommonStudentsFromTeachers,
    suspendStudent: suspendStudent
};
