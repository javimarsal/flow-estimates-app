const { Router } = require('express');
const panelController = require('../controllers/panel.controller')

// enrutador que permite guardar rutas (URLs del servidor)
const panelRouter = Router();

// Para utilizar estas rutas deben requerirse en app.js
// CRUD (Create - Read - Update - Delete)
panelRouter.get('/', panelController.getPanels);

panelRouter.post('/:projectId', panelController.createPanel);

panelRouter.get('/:id', panelController.getPanel);

panelRouter.put('/:id', panelController.editPanel);

panelRouter.delete('/:id', panelController.deletePanel);

module.exports = panelRouter;