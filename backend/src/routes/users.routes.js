const { Router } = require('express');
const userController = require('../controllers/user.controller')

// enrutador que permite guardar rutas (URLs del servidor)
const userRouter = Router();

// Para utilizar estas rutas deben requerirse en app.js
// CRUD (Create - Read - Update - Delete)
userRouter.get('/', userController.getUsers);

userRouter.post('/', userController.createUser);

userRouter.get('/:id', userController.getUser);

userRouter.put('/:id', userController.editUser);

userRouter.delete('/:id', userController.deleteUser);

userRouter.post('/signin', userController.signin);

userRouter.post('/signup', userController.signup);

userRouter.get('/confirmation/:token', userController.confirmEmail);

userRouter.post('/openedProject', userController.setOpenedProject);

// update list of projects of user
userRouter.put('/:id/projects', userController.addProject);

// delete a project from the list of projects
userRouter.delete('/:uid/projects/:pid', userController.deleteProject);

module.exports = userRouter;