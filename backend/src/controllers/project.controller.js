const projectController = {}

const Project = require('../models/Project');

projectController.getProjects = async (req, res) => {
    const projects = await Project.find();
    res.json(projects)
}

projectController.createProject = async (req, res) => {
    // Creamos el objeto con lo que nos manda el cliente (req)
    const newProject = new Project(req.body)

    // Guardamos el nuevo objeto
    await newProject.save()

    res.send({ message: 'Project created' })
}

projectController.getProject = async (req, res) => {
    const project = await Project.findById(req.params.id)
    res.send(project)
}

projectController.editProject = async (req, res) => {
    await Project.findByIdAndUpdate(req.params.id, req.body)
    res.send({ message: `Project with id="${req.params.id}" updated` })
}

projectController.deleteProject = async (req, res) => {
    await Project.findByIdAndDelete(req.params.id)
    res.send({ message: `Project with id="${req.params.id}" deleted` })
}

projectController.getPanels = async (req, res) => {
    const project = await Project.findById(req.params.id).populate({
        path: 'panels',
        populate: {
            path: 'panel'
        }
    });
    
    // rellenamos el array panels para enviarlo como respuesta
    let panels = [];
    for (let p of project.panels) {
        panels.push(p.panel)
    }

    res.send(panels);
}

module.exports = projectController;