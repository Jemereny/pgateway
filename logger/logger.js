function log(message) {
    var today = new Date()
    console.log(`${today}: ${message}`)
}

module.exports.log = log
