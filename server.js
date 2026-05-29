const express = require('express');
const app = express();
const path = require('path');
const cors = require("cors");
app.use(cors()); // Allows all origins (not recommended for production)

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname + '/uploads/')));

require('./models');
require('./routes')(app);

require('./db');
require('./helpers/cron');


app.listen(5000, ()=>{
  console.log("Server Started at port 5000");
})
