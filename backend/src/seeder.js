var mongoose = require('mongoose');
require('dotenv').config();

mongoose.Promise = global.Promise;

// Modelo de Datos
var User = require('./models/User');
var Project = require('./models/Project');
var Panel = require('./models/Panel');
var WorkItem = require('./models/Work-item');
var Tag = require('./models/Tag');

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

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(async function () {
    var user1 = new User({
        name: 'Javier',
        surname: 'Martínez',
        email: 'javier@correo.es',
        password: '1234',
        confirmed: true,
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

    var tags1 = [
        new Tag({
            name: 'PG1',
            color: '#4da6ff'
        }),
        new Tag({
            name: 'PG2',
            color: '#4de1ff'
        }),
        new Tag({
            name: 'PG3',
            color: '#9933ff'
        }),
        new Tag({
            name: 'PG4',
            color: '#4019ff'
        }),
        new Tag({
            name: 'bug',
            color: '#d73a4a'
        }),
        new Tag({
            name: 'enhancement',
            color: '#a2eeef'
        }),
        new Tag({
            name: 'documentation',
            color: '#0075ca'
        }),
        new Tag({
            name: 'duplicate',
            color: '#cfd3d7'
        }),
        new Tag({
            name: 'weird problem',
            color: '#282828'
        })
    ];

    var workItems1 = [
        new WorkItem({
            idNumber: 3,
            title: 'Go home',
            description: '',
            panel: 'Done',
            position: 15,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-24')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-25')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-25')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 4,
            title: 'Fall asleep',
            description: '',
            panel: 'Done',
            position: 16,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-24')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-25')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-28')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 5,
            title: 'Brush teeth',
            description: 'Brush your teeth to be clean',
            panel: 'Done',
            position: 14,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-24')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-25')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-26')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 6,
            title: 'Get up',
            description: '',
            panel: 'Done',
            position: 13,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-24')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-27')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-27')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 8,
            title: 'Check e-mail',
            description: '',
            panel: 'Done',
            position: 12,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-22')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-27')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-27')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 9,
            title: 'Walk dog',
            description: '',
            panel: 'Done',
            position: 11,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-24')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-27')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-30')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 10,
            title: 'It\'s raining',
            description: '',
            panel: 'Done',
            position: 10,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-20')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-24')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-27')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 11,
            title: 'Please, stop raining',
            description: 'Just a joke!',
            panel: 'Done',
            position: 9,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-18')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-19')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-22')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 12,
            title: 'Say hello',
            description: 'Or whatever you want to say',
            panel: 'ToDO',
            position: 15,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-27')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-27')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 13,
            title: 'Have a break',
            description: 'You always need a break',
            panel: 'Done',
            position: 8,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-20')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-24')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-26')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 14,
            title: 'Tarea 1',
            description: 'Descripción de la Tarea 1',
            panel: 'Done',
            position: 7,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-27')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-27')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-27')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 15,
            title: 'Tarea 2',
            description: 'Descripción de la Tarea 2',
            panel: 'Done',
            position: 6,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-27')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-27')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-27')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 16,
            title: 'Tarea 3',
            description: '',
            panel: 'Done',
            position: 4,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-28')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-28')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-28')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 18,
            title: 'Tarea 5',
            description: '',
            panel: 'Done',
            position: 5,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-28')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-28')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-28')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 19,
            title: 'Tarea 6',
            description: '',
            panel: 'Done',
            position: 3,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-28')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-28')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-28')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 20,
            title: 'Tarea 7',
            description: '',
            panel: 'Done',
            position: 2,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-28')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-29')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-04-29')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 22,
            title: 'Tarea 9',
            description: 'Otra descripción',
            panel: 'Doing',
            position: 2,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-28')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-05-06')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 23,
            title: 'Tarea nueva',
            description: '',
            panel: 'Doing',
            position: 1,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-30')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-30')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 25,
            title: 'tarea',
            description: '',
            panel: 'Doing',
            position: 0,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-30')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-30')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 26,
            title: 'don\'t say hello',
            description: 'Just don\'t say hello to strangers',
            panel: 'Done',
            position: 1,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-04-30')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-04-30')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-05-07')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 27,
            title: 'Tarea 1',
            description: '',
            panel: 'ToDO',
            position: 22,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-03')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 28,
            title: 'Tarea 1',
            description: '',
            panel: 'ToDO',
            position: 21,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-03')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 29,
            title: 'Tarea 0',
            description: '',
            panel: 'Done',
            position: 0,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-03')
                },
                {
                    panel: 'Doing',
                    date: new Date('2022-05-05')
                },
                {
                    panel: 'Done',
                    date: new Date('2022-05-05')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 30,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 20,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 31,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 19,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 32,
            title: 'tarea nueva',
            description: '',
            panel: 'ToDO',
            position: 18,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 33,
            title: 'tarea 1',
            description: '',
            panel: 'ToDO',
            position: 17,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 34,
            title: 'tarea muy nueva',
            description: '',
            panel: 'ToDO',
            position: 16,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 35,
            title: 'tarea guay',
            description: '',
            panel: 'ToDO',
            position: 14,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 36,
            title: 'tareaaa',
            description: '',
            panel: 'ToDO',
            position: 13,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 37,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 12,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 38,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 11,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 39,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 10,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 40,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 9,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 41,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 8,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 42,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 7,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 43,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 6,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 44,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 5,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 45,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 4,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 46,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 3,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 47,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 2,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 48,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 1,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
            tags: []
        }),
        new WorkItem({
            idNumber: 49,
            title: 'tarea',
            description: '',
            panel: 'ToDO',
            position: 0,
            panelDateRegistry: [
                {
                    panel: 'ToDO',
                    date: new Date('2022-05-09')
                },
            ],
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

    await WorkItem.deleteMany();
    await Panel.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();
    await Tag.deleteMany();

    await Panel.insertMany(panels1);
    await WorkItem.insertMany(workItems1);
    await Tag.insertMany(tags1);

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
    let tags = await Tag.find();
    for (let t of tags) {
        project1.tags.push({
            tag: t._id
        });
    }
    await project1.save();

    // Poner etiquetas a los workItems
    for (let wI of workItems) {
        // elegir entre PG1-PG4 (uno)
        // Retorna un entero aleatorio entre min (incluido) y max (excluido)
        let index = Math.floor(Math.random() * (4 - 0)) + 0;
        wI.tags.push({
            tag: tags[index]._id
        });

        // elegir entre bug, enhancement, ... (dos)
        // Retorna un entero aleatorio entre min (incluido) y max (excluido)
        index = Math.floor(Math.random() * (7 - 4)) + 4;
        wI.tags.push({
            tag: tags[index]._id
        });
        index = Math.floor(Math.random() * (9 - 7)) + 7;
        wI.tags.push({
            tag: tags[index]._id
        });

        await wI.save();
    }
    
    let panels_1 = await Panel.find();
    for (let p_1 of panels_1) {
        project2.panels.push({
            panel: p_1._id
        });
    }
    await project2.save();

    let projects = await Project.find();
    user1.projects.push({
        role: 'Project Manager',
        project: projects[0]._id
    });
    user1.projects.push({
        role: 'Desarrollador',
        project: projects[1]._id
    });
    await user1.save();
    return await mongoose.disconnect();

}).catch(function (err) {
    console.log('Error:', err.message);
});