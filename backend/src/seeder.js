var mongoose = require('mongoose');
require('dotenv').config();

mongoose.Promise = global.Promise;

// Modelo de Datos
var Panel = require('./models/Panel');
var WorkItem = require('./models/Work-item');

// URI
const uri = process.env.DB_MONGO;

var db = mongoose.connection;

db.on('connecting', function () {
    console.log('Connecting to', uri);
});
db.on('connected', function () {
    console.log('Connected to', uri);
});
db.on('disconnecting', function () {
    console.log('Disconnecting from', uri);
});
db.on('disconnected', function () {
    console.log('Disconnected from', uri);
});
db.on('error', function (err) {
    console.error('Error:', err.message);
});

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(function () {
    var panels = [
        new Panel({
            name: 'ToDO',
            position: 0
        }),
        new Panel({
            name: 'Doing',
            position: 1
        }),
        new Panel({
            name: 'Done',
            position: 2
        }),
        new Panel({
            name: 'Closed',
            position: 3
        })
    ];

    var panelDateRegistry = [{
        panel: 'ToDO',
        date: new Date()
    }];

    var workItems = [
        new WorkItem({
            name: 'Get to work',
            panel: 'ToDO',
            position: 0,
            panelDateRegistry: panelDateRegistry
        }),
        new WorkItem({
            name: 'Pick up groceries',
            panel: 'ToDO',
            position: 1,
            panelDateRegistry: panelDateRegistry
        }),
        new WorkItem({
            name: 'Go home',
            panel: 'ToDO',
            position: 2,
            panelDateRegistry: panelDateRegistry
        }),
        new WorkItem({
            name: 'Fall asleep',
            panel: 'ToDO',
            position: 3,
            panelDateRegistry: panelDateRegistry
        }),
        new WorkItem({
            name: 'Brush teeth',
            panel: 'ToDO',
            position: 4,
            panelDateRegistry: panelDateRegistry
        }),
        new WorkItem({
            name: 'Get up',
            panel: 'ToDO',
            position: 5,
            panelDateRegistry: panelDateRegistry
        }),
        new WorkItem({
            name: 'Take a shower',
            panel: 'ToDO',
            position: 6,
            panelDateRegistry: panelDateRegistry
        }),
        new WorkItem({
            name: 'Check e-mail',
            panel: 'ToDO',
            position: 7,
            panelDateRegistry: panelDateRegistry
        }),
        new WorkItem({
            name: 'Walk dog',
            panel: 'ToDO',
            position: 8,
            panelDateRegistry: panelDateRegistry
        }),
    ];

    return WorkItem.deleteMany().then(function () {
        return Panel.deleteMany();
    }).then(function () {
        Panel.insertMany(panels);
    }).then(function () {
        WorkItem.insertMany(workItems);
    });/*.then(function () {
        return mongoose.disconnect();
    });*/

}).catch(function (err) {
    console.log('Error:', err.message);
});