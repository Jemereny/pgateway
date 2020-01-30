const express = require('express')
const app = express();
const port = process.env.PORT || 9800;

app.use('/', require('./routes/index'));

app.listen(port, () => console.log(`Listening on port ${port}...`))
