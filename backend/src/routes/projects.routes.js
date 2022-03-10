const { Router } = require('express');
const projectController = require('../controllers/project.controller')

// enrutador que permite guardar rutas (URLs del servidor)
const router = Router();

// Para utilizar estas rutas deben requerirse en app.js
// CRUD (Create - Read - Update - Delete)
router.get('/', projectController.getProjects);

router.post('/', projectController.createProject);

router.get('/:id', projectController.getProject);

router.put('/:id', projectController.editProject);

router.delete('/:id', projectController.deleteProject);

// get panels of project
router.get('/:id/panels', projectController.getPanels);

// get workItems of project
router.get('/:id/workitems', projectController.getWorkItems);

// update list of workItems of project
router.put('/:id/workitems', projectController.addWorkItems);

module.exports = router;