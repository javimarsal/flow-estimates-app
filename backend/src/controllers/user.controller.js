const userController = {}

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
            res.send({ user })
        })
        .catch(() => {
            res.status(401).send({ message: 'Invalid credentials' })
        })
}

module.exports = userController;