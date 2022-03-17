const mongoose = require('mongoose')
require('dotenv').config();

// const uri = process.env.DB_MONGO;
const uri = process.env.DB_MONGO_ATLAS;

mongoose.connect(uri)
  .then(db => console.log('DB is connected'))
  .catch(err => console.error(err));