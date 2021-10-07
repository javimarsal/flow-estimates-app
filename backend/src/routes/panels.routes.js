const { Router } = require('express');
const panelController = require('../controllers/panel.controller')

// enrutador que permite guardar rutas (URLs del servidor)
const router = Router();

// Para utilizar estas rutas deben requrirse en app.js
// CRUD (Create - Read - Update - Delete)
router.get('/', panelController.getPanels);

router.post('/', panelController.creatPanel);

router.get('/:id', panelController.getPanel);

router.put('/:id', panelController.editPanel);

router.delete('/:id', panelController.deletePanel);

module.exports = router;