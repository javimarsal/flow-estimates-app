const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

// Permite usar variables de entorno
require('dotenv').config();

const app = express();

// Variable port usada en index.js
app.set('port', process.env.PORT || 4000);

// Permite aceptar peticiones que vienen de otros servidores (app de angular)
app.use(cors());

// Permite que se muestren por consola las peticiones que se van produciendo
app.use(morgan('dev'));

// Permite entender objetos JSON
app.use(express.json());

// Permite entender los datos de un formulario HTML
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + './../public/'));

// Las rutas/páginas de la app
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

app.get('/home', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

app.get('/signup', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

app.get('/my-projects', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

app.get('/project/:id', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

app.get('/project/:id/estimate-single', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

app.get('/project/:id/estimate-multiple', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

app.get('/project/:id/tags', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

app.get('/project/:id/estimate-multiple-howMany', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

app.get('/confirmation/:token', function(req, res) {
    res.sendFile(path.join(__dirname + './../public/index.html'));
});

// Rutas para acceder a la base de datos
app.use("/api/projects", require('./routes/projects.routes'))
app.use("/api/users", require('./routes/users.routes'))
app.use("/api/workitems", require('./routes/work-items.routes'))
app.use("/api/panels", require('./routes/panels.routes'))
app.use("/api/tags", require('./routes/tags.routes'))

module.exports = app;