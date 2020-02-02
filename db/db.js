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
     * 
     * Returns
     * - True on success
     * - False on error
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
     * 
     * Returns
     * - True on success
     * - False on error
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
     * 
     * Returns
     * - True on success
     * - False on error
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

async function registerTeacherStudents(teacherEmail, studentEmails) {
    /**
     * Registers a teacher and a student into the notifiation table
     * 
     * Creates teacher/student if teacher/student does not exist 
     * and adds into notification table
     * 
     * Returns
     * - True if success
     * - False if error has occured
     */

    // Create entries if teacher/student does not exist
    let createTeacherPromise = createUserInTableIfNotExist(teacherEmail, TEACHER_TABLE);
    let createStudentPromises = [];
    studentEmails.forEach(studentEmail => createStudentPromises.push(createUserInTableIfNotExist(studentEmail, STUDENT_TABLE)));

    // Wait for all students to be created
    await Promise.all([createTeacherPromise, ...createStudentPromises]).catch(err => {
        logger.log("registerTeacherStudents:" + err);
        return false;
    });

    // Set notifications
    let addNotificationPromises = [];
    studentEmails.forEach(studentEmail => addNotificationPromises.push(addNotificationTeacherStudent(teacherEmail, studentEmail)));

    await Promise.all(addNotificationPromises).catch(err => {
        logger.log("registerTeacherStudents:" + err);
        return false;
    });

    return true;
}

async function getCommonStudentsFromTeachers(teacherEmails) {
    /**
     * Gets the common students from all different teachers
     * 
     * The query is dynamic so to accomodate the multiple teacher emails
     * Returns:
     * - [] of student emails who have the teachers that are input in common.
     * 
     */
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
    /**
     * Retrieves common students from teachers
     * 
     * Returns:
     * - [] of student emails who have the teachers that are input in common.
     * - null if an error has occured
     */
    const studentEmails = await getCommonStudentsFromTeachers(teacherEmails)
    .catch(err => {
        logger.log("retrieveCommonStudentsFromTeachers: " + err);
        return null;
    });

    return studentEmails;
}

async function updateSuspendStudent(studentEmail, is_suspended) {
    /**
     * Updates is_suspended value in student table
     * 
     * Returns
     * - True if a row is updated (user exists)
     * - False if a row is not updated (user does not exist)
     */
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
    /**
     * Suspends a student
     * 
     * Returns:
     * - True update succeeds
     * - False if no rows are affected
     * - null if an error in the sql has occured.
     * 
     */
    const has_succeeded = await updateSuspendStudent(studentEmail, true)
    .catch(err => 
        {
            logger.log("suspendStudent: " + err);
            return null;
        });

    return has_succeeded;
}

async function retrieveAllStudentsWithSuspension(is_suspended) {
    /**
     * Returns all students which are suspended/not suspended
     * 
     * Returns:
     * - [] of student emails who are suspended
     *
     */
    const query = `
    SELECT email
    FROM ${STUDENT_TABLE}
    WHERE is_suspended=${is_suspended}
    `

    return new Promise((resolve, reject) => {
        connection.query(query, (err, rows) => {
            if (err) {
                logger.log("retrieveAllStudents: " + err);
                reject("retrieveAllStudentsWithSuspension:" + err);
            }

            const studentEmails = []
            rows.forEach(row => studentEmails.push(row["email"]))

            resolve(studentEmails);
        })
    })
}

async function retrieveAllSuspendedStudents() {
    /**
     * Retrieves all suspended students
     * 
     * Returns
     * - [] of student emails who are suspended
     * - null if an error has occured
     */

     studentEmails = await retrieveAllStudentsWithSuspension(true)
     .catch(err => {
         logger.log("retrieveAllSuspendedStudents: " + err);
         return null;
     });

     return studentEmails;
}

async function retrieveStudentsForNotification(teacherEmail, is_suspended) {
    /**
     * Retrieves students who are under a teacher and is not suspended
     * 
     * Returns:
     * - [] of students who is under a specific teacher's notification's list and is not suspended
     */
    const teacherIdQuery= `
    SELECT id
    FROM ${TEACHER_TABLE}
    WHERE email='${teacherEmail}'
    `

    // Query selects all students who are under teacherEmail
    // Then joins with the students table who is not suspended
    // Returned is the students who are not suspended and under teacherEmail
    const query = `
    SELECT email
    FROM (
        SELECT id, email
        FROM ${STUDENT_TABLE}
        WHERE is_suspended=${is_suspended}
    ) a
    INNER JOIN (
        SELECT student_email_id
        FROM ${NOTIFICATION_TABLE}
        WHERE teacher_email_id=(${teacherIdQuery})
    ) b
    ON a.id=b.student_email_id
    `

    return new Promise((resolve, reject) => {
        connection.query(query, (err, rows) => {
            if (err) {
                logger.log("retrieveStudentsForNotification: " + err);
                reject(err);
            }

            const studentEmails = [];
            rows.forEach(row => studentEmails.push(row["email"]))

            resolve(studentEmails);
        })
    })
}

async function retrieveNotSuspendedStudentsForNotification(teacherEmail) {
    /**
     * Retrieve students who are not suspended and is under a teacher's notification list
     * 
     * Returns:
     * - [] of students who are not suspended and is under a teacher's notification list
     * - null if an error has occured
     */
    const studentEmails = await retrieveStudentsForNotification(teacherEmail, false)
    .catch(err => {
        logger.log("retrieveNotSuspendedStudentsForNotification: " + err);
        return null;
    });

    return studentEmails
}

module.exports = {
    registerTeacherStudents: registerTeacherStudents,
    retrieveCommonStudentsFromTeachers: retrieveCommonStudentsFromTeachers,
    suspendStudent: suspendStudent,
    retrieveNotSuspendedStudentsForNotification: retrieveNotSuspendedStudentsForNotification,
    retrieveAllSuspendedStudents: retrieveAllSuspendedStudents
};
