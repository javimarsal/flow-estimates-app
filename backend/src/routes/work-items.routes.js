const { Router } = require('express');
const workItemController = require('../controllers/work-items.controller')

// enrutador que permite guardar rutas (URLs del servidor)
const workItemRouter = Router();

// Para utilizar estas rutas deben requerirse en app.js
// CRUD (Create - Read - Update - Delete)
workItemRouter.get('/', workItemController.getWorkItems);

workItemRouter.post('/', workItemController.creatWorkItem);

workItemRouter.get('/:id', workItemController.getWorkItem);

workItemRouter.put('/:id', workItemController.editWorkItem);

workItemRouter.delete('/:id', workItemController.deleteWorkItem);

// get tags of workItem
workItemRouter.get('/:id/tags', workItemController.getTags);

// update list of tags of workItem
workItemRouter.put('/:id/tags', workItemController.addTag);

// delete a tag from the list of tags
workItemRouter.delete('/:wid/tags/:tid', workItemController.deleteTag);

module.exports = workItemRouter;