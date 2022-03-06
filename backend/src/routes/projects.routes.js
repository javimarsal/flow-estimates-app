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

module.exports = router;