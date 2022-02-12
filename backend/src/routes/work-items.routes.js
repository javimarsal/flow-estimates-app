const { Router } = require('express');
const workItemController = require('../controllers/work-items.controller')

// enrutador que permite guardar rutas (URLs del servidor)
const router = Router();

// Para utilizar estas rutas deben requrirse en app.js
// CRUD (Create - Read - Update - Delete)
router.get('/', workItemController.getWorkItems);

router.post('/', workItemController.creatWorkItem);

router.get('/:id', workItemController.getWorkItem);

router.get('/name/:name', workItemController.getWorkItem_ByName);

router.put('/:id', workItemController.editWorkItem);

router.delete('/:id', workItemController.deleteWorkItem);

module.exports = router;