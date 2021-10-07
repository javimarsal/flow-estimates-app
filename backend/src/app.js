const express = require('express')
const morgan = require('morgan')
// Permite usar variables de entorno
require('dotenv').config();

const app = express()

// Variable port usada en index.js
app.set('port', process.env.PORT || 4000);

// Permite que se muestren por consola las peteciones que se van produciendo
app.use(morgan('dev'));

// Permite entender objetos JSON
app.use(express.json());

// Permite entender los datos de un formulario HTML
app.use(express.urlencoded({ extended: false }));

// Rutas del servidor
// se pueden usar las rutas del archivo requerido si antes llevan (en la ruta) "api/workitems"
app.use("/api/workitems", require('./routes/work-items.routes'))

module.exports = app;