const getStudentsInNotification = require("../../../routes/api/retrievefornotifications").getStudentsInNotification

test('Gets all mentioned students into array format', () => {
    expect(getStudentsInNotification("Hello! @abc@gmail.com @def@hotmail.com"))
    .toEqual(expect.arrayContaining([
        'abc@gmail.com',
        'def@hotmail.com'
    ]))
})
