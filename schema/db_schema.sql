CREATE DATABASE IF NOT EXISTS govtech;

use govtech

DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `teachers`;
DROP TABLE IF EXISTS `students`;

CREATE TABLE `teachers` (
    id int NOT NULL AUTO_INCREMENT,
    teacher_email varchar(255) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE `students` (
    id int NOT NULL AUTO_INCREMENT,
    student_email varchar(255) NOT NULL,
    is_suspended BOOLEAN NOT NULL DEFAULT 0,
    PRIMARY KEY(id)
);

CREATE TABLE `notifications` (
    teacher_email int NOT NULL,
    student_email int NOT NULL,
    FOREIGN KEY(teacher_email) REFERENCES teachers(id),
    FOREIGN KEY(student_email) REFERENCES students(id)
);
