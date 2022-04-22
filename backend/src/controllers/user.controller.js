const userController = {}

const mongoose = require('mongoose');
const User = require('../models/User');

userController.getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users)
}

userController.createUser = async (req, res) => {
    // Creamos el objeto con lo que nos manda el cliente (req)
    const newUser = new User(req.body)

    // Guardamos el nuevo objeto
    await newUser.save()

    res.send({ message: 'User created' })
}

userController.getUser = async (req, res) => {
    const user = await User.findById(req.params.id).populate({
        path: 'projects',
        populate: {
            path: 'project'
        }
    })
    res.send(user)
}

userController.editUser = async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, req.body)
    res.send({ message: `User with id="${req.params.id}" updated` })
}

userController.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id)
    res.send({ message: `User with id="${req.params.id}" deleted` })
}

userController.signin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    await User.findOne({ email, password })
        .then(user => {
            res.send(user)
        })
        .catch(() => {
            res.status(401).send({ message: 'Invalid credentials' })
        })
}

userController.signup = async (req, res) => {
    let email = req.body.email;
    let userExist;

    await User.findOne({ email })
        .then(user => userExist = user);
    
    if (userExist) {
        res.status(401).send({ message: 'El correo proporcionado ya está siendo usado por otro usuario' });
        return;
    }

    // si no existe, se crea el nuevo usuario
    let newUser = new User(req.body);

    await newUser.save()
        .then((user) => {
            console.log(user);
            res.send({ message: `Se ha creado un nuevo usuario con correo:"${req.body.email}"` });
        })
        .catch(() => res.send({ message: 'No se pudo crear el usuario' }));
    
}

userController.setOpenedProject = async (req, res) => {
    let projectId = req.body.projectId;
    let uid = req.body.uid;

    let user = await User.findById(uid)
        .catch(error => console.log(error));

    // Si el projectId es el que ya tiene, no se actualiza
    if (projectId == user.openedProject) {
        return res.send({ message: 'No opened project update' })
    }

    user.openedProject = new mongoose.Types.ObjectId(projectId);
    await user.save()
        .catch(error => console.log(error));
    
    res.send({ message: `Now project with id="${projectId}" is the openedProject of user with id="${uid}"` });
}

module.exports = userController;