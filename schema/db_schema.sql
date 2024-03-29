CREATE DATABASE IF NOT EXISTS govtech;

use govtech

DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `teachers`;
DROP TABLE IF EXISTS `students`;

CREATE TABLE `teachers` (
    id int NOT NULL AUTO_INCREMENT,
    email varchar(255) NOT NULL,
    PRIMARY KEY(id),
    UNIQUE (email)
);

CREATE TABLE `students` (
    id int NOT NULL AUTO_INCREMENT,
    email varchar(255) NOT NULL,
    is_suspended BOOLEAN NOT NULL DEFAULT 0,
    PRIMARY KEY(id),
    UNIQUE (email)
);

CREATE TABLE `notifications` (
    teacher_email_id int NOT NULL,
    student_email_id int NOT NULL,
    FOREIGN KEY(teacher_email_id) REFERENCES teachers(id),
    FOREIGN KEY(student_email_id) REFERENCES students(id)
);
