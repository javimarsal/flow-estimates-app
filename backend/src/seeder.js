var mongoose = require('mongoose');
require('dotenv').config();

mongoose.Promise = global.Promise;

// Modelo de Datos
var User = require('./models/User');
var Project = require('./models/Project');
var Panel = require('./models/Panel');
var WorkItem = require('./models/Work-item');

// URI
// const uri = process.env.DB_MONGO;
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
    var user1 = new User({
        name: 'Javier',
        surname: 'Martínez',
        email: 'javier@correo.es',
        password: '1234',
        projects: []
    });

    var project1 = new Project({
        name: 'Proyecto Casa Blanca',
        panels: [],
        workItems: [],
        tags: []
    });

    var project2 = new Project({
        name: 'Proyecto Astro',
        panels: [],
        workItems: [],
        tags: []
    });

    var panels1 = [
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

    var workItems1 = [
        new WorkItem({
            idNumber: 1,
            title: 'Get to work',
            description: 'Yes, let\'s go!',
            panel: 'ToDO',
            position: 0,
            panelDateRegistry: panelDateRegistry,
            tags: []
        }),
        new WorkItem({
            idNumber: 2,
            title: 'Pick up groceries',
            description: '',
            panel: 'ToDO',
            position: 1,
            panelDateRegistry: panelDateRegistry,
            tags: []
        }),
        new WorkItem({
            idNumber: 3,
            title: 'Go home',
            description: '',
            panel: 'ToDO',
            position: 2,
            panelDateRegistry: panelDateRegistry,
            tags: []
        }),
        new WorkItem({
            idNumber: 4,
            title: 'Fall asleep',
            description: '',
            panel: 'ToDO',
            position: 3,
            panelDateRegistry: panelDateRegistry,
            tags: []
        }),
        new WorkItem({
            idNumber: 5,
            title: 'Brush teeth',
            description: '',
            panel: 'ToDO',
            position: 4,
            panelDateRegistry: panelDateRegistry,
            tags: []
        }),
        new WorkItem({
            idNumber: 6,
            title: 'Get up',
            description: '',
            panel: 'ToDO',
            position: 5,
            panelDateRegistry: panelDateRegistry,
            tags: []
        }),
        new WorkItem({
            idNumber: 7,
            title: 'Take a shower',
            description: '',
            panel: 'ToDO',
            position: 6,
            panelDateRegistry: panelDateRegistry,
            tags: []
        }),
        new WorkItem({
            idNumber: 8,
            title: 'Check e-mail',
            description: '',
            panel: 'ToDO',
            position: 7,
            panelDateRegistry: panelDateRegistry,
            tags: []
        }),
        new WorkItem({
            idNumber: 9,
            title: 'Walk dog',
            description: 'Walk my dog Coffee',
            panel: 'ToDO',
            position: 8,
            panelDateRegistry: panelDateRegistry,
            tags: []
        }),
    ];

    // var workItems2 = [
    //     new WorkItem({
    //         name: 'Plant seeds',
    //         panel: 'ToDO',
    //         position: 0,
    //         panelDateRegistry: panelDateRegistry
    //     }),
    //     new WorkItem({
    //         name: 'Pick up groceries',
    //         panel: 'ToDO',
    //         position: 1,
    //         panelDateRegistry: panelDateRegistry
    //     }),
    //     new WorkItem({
    //         name: 'Wash the rover',
    //         panel: 'ToDO',
    //         position: 2,
    //         panelDateRegistry: panelDateRegistry
    //     }),
    //     new WorkItem({
    //         name: 'Check vital signs',
    //         panel: 'ToDO',
    //         position: 3,
    //         panelDateRegistry: panelDateRegistry
    //     }),
    //     new WorkItem({
    //         name: 'Communicate with martians',
    //         panel: 'ToDO',
    //         position: 4,
    //         panelDateRegistry: panelDateRegistry
    //     }),
    // ];

    return WorkItem.deleteMany().then(function () {
        return Panel.deleteMany();
    }).then(function () {
        return Project.deleteMany();
    }).then(function () {
        return User.deleteMany();
    }).then(function () {
        return Panel.insertMany(panels1);
    }).then(function () {
        return WorkItem.insertMany(workItems1);
    }).then(async function () {
        let panels = await Panel.find();
        for (let p of panels) {
            project1.panels.push({
                panel: p._id
            });
        }

        let workItems = await WorkItem.find();
        for (let wI of workItems) {
            project1.workItems.push({
                workItem: wI._id
            });
        }

        return project1.save();
    }).then(async function () {
        let panels = await Panel.find();
        for (let p of panels) {
            project2.panels.push({
                panel: p._id
            });
        }

        return project2.save();
    }).then(async function () {
        let projects = await Project.find();
        user1.projects.push({
            role: 'Project Manager',
            project: projects[0]._id
        })

        user1.projects.push({
            role: 'Desarrollador',
            project: projects[1]._id
        })
        
        //user1.openedProject = projects[0]._id;

        return user1.save();
    }).then(function () {
        return mongoose.disconnect();
    });

}).catch(function (err) {
    console.log('Error:', err.message);
});