const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

// Permite usar variables de entorno
require('dotenv').config();

const app = express()

// Variable port usada en index.js
app.set('port', process.env.PORT || 4000);

// Permite aceptar peticiones que vienen de otros servidores (app de angular)
app.use(cors())

// Permite que se muestren por consola las peticiones que se van produciendo
app.use(morgan('dev'));

// Permite entender objetos JSON
app.use(express.json());

// Permite entender los datos de un formulario HTML
app.use(express.urlencoded({ extended: false }));

// Rutas del servidor
// se pueden usar las rutas del archivo requerido si antes llevan (en la ruta) "api/workitems"
app.use("/api/projects", require('./routes/projects.routes'))
app.use("/api/users", require('./routes/users.routes'))
app.use("/api/workitems", require('./routes/work-items.routes'))
app.use("/api/panels", require('./routes/panels.routes'))

module.exports = app;