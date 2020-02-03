# v0.0.15
- Added test module 'jest'
- Added unit test for parsing notifications

# v0.0.14
- Refactored add notification query to not have duplicates
- Refactored create user query to not have duplicates
- Modified database schema for students and teachers to have unique emails
- Fix register bug on returning before promise ends

# v0.0.13
- Added functionality to retrievefornotifications endpoint

# v0.0.12
- Added updating of students in db client
- Added functionality to suspend endpoint

# v0.0.11
- Modified error handling for common students

# v0.0.10
- Added searching for common students in db client
- Added finding common students functionality to commonstudents endpoint

# v0.0.9
- Added multiple registration for student/teacher in db client
- Add register functionality to register endpoint

# v0.0.8
- Modified db functions to be more robust and use promises for registration of student and teacher

# v0.0.7
- Added mysql module for connection to mysql db
- Added connection to db

# v0.0.6
- Added docker components to run locally
- Added mysql and table schemas for teachers and students

# v0.0.5
- Setup retrievefornotifications endpoint
- Modified error messages

# v0.0.4
- Setup suspend endpoint

# v0.0.3
- Setup commonstudents endpoint

# v0.0.2
- Setup register endpoint
- Added Joi module for json validation

# v0.0.1
Initial Commit
- Setup app index, packages, default route
