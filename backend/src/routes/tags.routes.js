const { Router } = require('express');
const tagController = require('../controllers/tag.controller');

// enrutador que permite guardar rutas (URLs del servidor)
const tagRouter = Router();

// Para utilizar estas rutas deben requerirse en app.js
// CRUD (Create - Read - Update - Delete)
tagRouter.get('/', tagController.getTags);

tagRouter.post('/', tagController.createTag);

tagRouter.get('/:id', tagController.getTag);

tagRouter.put('/:id', tagController.editTag);

tagRouter.delete('/:id', tagController.deleteTag);

module.exports = tagRouter;