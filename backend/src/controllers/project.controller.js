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

projectController.getWorkItems = async (req, res) => {
    const project = await Project.findById(req.params.id).populate({
        path: 'workItems',
        populate: {
            path: 'workItem'
        }
    });

    // rellenamos el array workItems para enviarlo como respuesta
    let workItems = [];
    for (let wI of project.workItems) {
        workItems.push(wI.workItem)
    }

    res.send(workItems);
}

projectController.addWorkItem = async (req, res) => {
    const project = await Project.findById(req.params.id);
    const workItem = req.body;

    // Añadimos el workItem a la lista de project
    project.workItems.push({
        workItem: workItem._id
    });

    await project.save();
    
    res.send({ message: `work-item with id="${workItem._id}" has been added to project with id="${project._id}"` });
}

projectController.deleteWorkItem = async (req, res) => {
    const project = await Project.findById(req.params.pid);
    const workItemId = req.params.wid;

    // Buscar el id del workItem en la lista de Project y eliminarlo
    let workItemsOfProject = project.workItems;
    let wIPLength = workItemsOfProject.length;
    for (let i = 0; i < wIPLength; i++) {
        if (workItemsOfProject[i].workItem.toString() == workItemId) {
            workItemsOfProject.splice(i, 1);
            break;
        }
    }

    // Guardamos el Project con la lista actualizada
    await project.save();

    res.send({ message: `work-item with id="${workItemId}" has been removed from project with id="${project._id}"` });
}

module.exports = projectController;