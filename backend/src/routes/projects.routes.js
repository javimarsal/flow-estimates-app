const { Router } = require('express');
const projectController = require('../controllers/project.controller')

// enrutador que permite guardar rutas (URLs del servidor)
const projectRouter = Router();

// Para utilizar estas rutas deben requerirse en app.js
// CRUD (Create - Read - Update - Delete)
projectRouter.get('/', projectController.getProjects);

projectRouter.post('/', projectController.createProject);

projectRouter.get('/:id', projectController.getProject);

projectRouter.put('/:id', projectController.editProject);

projectRouter.delete('/:id', projectController.deleteProject);

// get panels of project
projectRouter.get('/:id/panels', projectController.getPanels);

// get workItems of project
projectRouter.get('/:id/workitems', projectController.getWorkItems);

// update list of workItems of project
projectRouter.put('/:id/workitems', projectController.addWorkItem);

// delete a workItem for the list of workItems
projectRouter.delete('/:pid/workitems/:wid', projectController.deleteWorkItem)

module.exports = projectRouter;