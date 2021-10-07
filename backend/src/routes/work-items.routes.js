const { Router } = require('express');
const workitemController = require('../controllers/work-items.controller')

// enrutador que permite guardar rutas (URLs del servidor)
const router = Router();

// Para utilizar estas rutas deben requrirse en app.js
// CRUD (Create - Read - Update - Delete)
router.get('/', workitemController.getWorkitems);

router.post('/', workitemController.creatWorkitem);

router.get('/:id', workitemController.getWorkitem);

router.put('/:id', workitemController.editWorkitem);

router.delete('/:id', workitemController.deleteWorkitem);

module.exports = router;