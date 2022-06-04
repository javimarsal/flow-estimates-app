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

// get tags of project
projectRouter.get('/:id/tags', projectController.getTags);

// update list of panels of project
projectRouter.put('/:id/panels', projectController.addPanel);

// update list of workItems of project
projectRouter.put('/:id/workitems', projectController.addWorkItem);

// update list of tags of project
projectRouter.put('/:id/tags', projectController.addTag);

// delete a panel from the list of panels
projectRouter.delete('/:pid/panels/:panelId', projectController.deletePanel);

// delete a workItem from the list of workItems
projectRouter.delete('/:pid/workitems/:wid', projectController.deleteWorkItem)

// delete a tag from the list of tags
projectRouter.delete('/:pid/tags/:tid', projectController.deleteTag);

module.exports = projectRouter;