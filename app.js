const express = require('express')
const app = express();
const port = process.env.PORT || 9800;

app.use(express.json())

app.use('/', require('./routes/index'));

apiroutes = [require("./routes/api/register"),
            require("./routes/api/commonstudents"),
            require("./routes/api/suspend")]

app.use('/api', apiroutes);

app.listen(port, () => console.log(`Listening on port ${port}...`))
