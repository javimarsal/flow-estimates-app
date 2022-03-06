const userController = {}

const User = require('../models/User');

userController.getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users)
}

userController.createUser = async (res, res) => {
    // Creamos el objeto con lo que nos manda el cliente (req)
    const newUser = new User(req.body)

    // Guardamos el nuevo objeto
    await newUser.save()

    res.send({ message: 'User created' })
}

userController.getUser = async (req, res) => {
    const user = await User.findById(req.params.id)
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

module.exports = userController;