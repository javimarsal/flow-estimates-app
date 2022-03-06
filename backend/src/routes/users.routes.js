const { Router } = require('express');
const userController = require('../controllers/user.controller')

// enrutador que permite guardar rutas (URLs del servidor)
const router = Router();

// Para utilizar estas rutas deben requerirse en app.js
// CRUD (Create - Read - Update - Delete)
router.get('/', userController.getUsers);

router.post('/', userController.createUser);

router.get('/:id', userController.getUser);

router.put('/:id', userController.editUser);

router.delete('/:id', userController.deleteUser);

module.exports = router;