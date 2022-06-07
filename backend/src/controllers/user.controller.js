const userController = {}

const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
    try {
        const user = await User.findById(req.params.id).populate({
            path: 'projects',
            populate: {
                path: 'project',
                populate: [
                    {
                        path: 'panels',
                        populate: { path: 'panel' }
                    },
                    {
                        path: 'tags',
                        populate: { path: 'tag' }
                    },
                    {
                        path: 'workItems',
                        populate: { path: 'workItem' }
                    }
                ]
            }
        })
        return res.send(user);
    }
    catch (error) {
        console.log(error)
    }
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

    try {
        let user = await User.findOne({ email });
        if (bcrypt.compareSync(password, user.password)) {
            return res.send(user);
        }
        else {
            return res.send(undefined);
        }
    }
    catch (error) {
        console.log(error);
        return res.status(401).send({ message: 'Invalid credentials' });
    }

}

userController.signup = async (req, res) => {
    let email = req.body.email;
    let userExist;

    await User.findOne({ email })
        .then(user => userExist = user);
    
    if (userExist) {
        return res.status(401);
    }

    // si no existe, se crea el nuevo usuario
    let newUser = new User(req.body);

    // Encriptar contraseña
    newUser.password = bcrypt.hashSync(newUser.password, 10);

    const user = await newUser.save();
    if (user) {
        res.send({ message: `Se ha creado un nuevo usuario con correo:"${req.body.email}"` });
    }
    else {
        return res.send({ message: 'No se pudo crear el usuario' });
    }

    // Enviar un correo para confirmar el correo electrónico proporcionado

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    
    jwt.sign(
        {
            user: user._id,
        },
        process.env.EMAIL_SECRET,
        {
            expiresIn: '1d',
        },
        function (err, token) {
            const url = `${process.env.HOSTNAME}/confirmation/${token}`;

            transporter.sendMail({
                from: `"Flow Estimates" <${process.env.EMAIL}>`,
                to: user.email,
                subject: 'Confirm Email',
                text: 'Por favor, pincha en este enlace para confirmar tu email: confirmar email',
                html: `Por favor, pincha en este enlace para confirmar tu email: <a href="${url}">confirmar email</a>`,
            });
        },
    );
    
}

userController.confirmEmail = async (req, res) => {
    let token = req.params.token;
    let userId = '';
    try {
        userId = jwt.verify(token, process.env.EMAIL_SECRET).user;
        
    }
    catch (error) {
        console.log(error);
        res.status(400);
    }

    if (!userId) {
        return res.status(400);
    }

    try {
        let user = await User.findById(userId);
        if (!user.confirmed) {
            user.confirmed = true;
            await user.save();
        }

        return res.status(200);
    }
    catch (error) {
        console.log(error);
        return res.status(401);
    }
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

// Obtener los projects del usuario
userController.getProjects = async (req, res) => {
    const user = await User.findById(req.params.id).populate({
        path: 'projects',
        populate: { path: 'project' }
    });

    // rellenamos el array projects para enviarlo como respuesta
    let projects = [];
    for (let p of user.projects) {
        projects.push(p.project);
    }

    return res.send(projects);
}

// Añadir project
userController.addProject = async (req, res) => {
    let user = await User.findById(req.params.id);
    let project = req.body;

    // Añadimos el project a la lista de user
    user.projects.push({
        role: 'Project Manager',
        project: project._id
    });

    await user.save();

    return res.send(user);
}

// Eliminar project
userController.deleteProject = async (req, res) => {
    let user = await User.findById(req.params.uid);
    let projectId = req.params.pid;

    // Buscar el id del project en la lista de User y eliminarlo
    let userProjects = user.projects;
    let userProjectsLength = userProjects.length;

    for (let i = 0; i < userProjectsLength; i++) {
        if (userProjects[i].project.toString() == projectId) {
            userProjects.splice(i, 1);
            break;
        }
    }
    
    // Si user ya no tiene proyectos
    if (userProjects.length == 0) {
        user.openedProject = undefined;
    }

    // Si el proyecto eliminado era el openedProject de user, lo eliminamos
    if (user.openedProject && userProjects.length != 0) {
        if (user.openedProject.toString() == projectId) {
            user.openedProject = undefined;
        }
    }

    // Guardamos el User con la lista actualizada
    await user.save();

    return res.send(user);
}

module.exports = userController;