const mongoose = require('mongoose')
require('dotenv').config();

const uri = process.env.DB_MONGO;

mongoose.connect(uri)
  .then(db => console.log('DB is connected'))
  .catch(err => console.error(err));