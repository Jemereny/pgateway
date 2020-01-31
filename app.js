const express = require('express')
const app = express();
const port = process.env.PORT || 9800;

app.use(express.json())

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api/register'));

app.listen(port, () => console.log(`Listening on port ${port}...`))
