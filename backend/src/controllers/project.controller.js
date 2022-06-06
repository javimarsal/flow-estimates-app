const projectController = {}

const Project = require('../models/Project');
const User = require('../models/User');

projectController.getProjects = async (req, res) => {
    const projects = await Project.find();
    return res.json(projects);
}

projectController.createProject = async (req, res) => {
    // ID del usuario que está creando el proyecto
    // utilizado para evitar crear proyectos con nombres duplicados
    const uid = req.params.uid;
    const projectName = req.body.name;
    
    // Solo guardar el proyecto si el nombre no existe en los proyectos del usuario (necesitamos el uid)
    let projectNameExist = await projectController.checkNameExistInUserList(uid, projectName);

    // Si existe el nombre en la lista del usuario, devolvemos undefined
    if (projectNameExist) return res.send(undefined);

    // Si no existe el nombre, creamos el objeto con lo que nos manda el cliente (req.body)
    const newProject = new Project(req.body);

    // Guardamos el nuevo objeto
    await newProject.save();

    // Y enviamos el nuevo proyecto al cliente
    return res.send(newProject);
}

projectController.getProject = async (req, res) => {
    const project = await Project.findById(req.params.id)
    res.send(project)
}

projectController.editProject = async (req, res) => {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body)
    res.send(project);
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

projectController.addPanel = async (req, res) => {
    const project = await Project.findById(req.params.id);
    const panel = req.body;

    // Añadimos el panel a la lista de project
    project.panels.push({
        panel: panel._id
    });

    await project.save();
    
    res.send({ message: `panel with id="${panel._id}" has been added to project with id="${project._id}"` });
}

projectController.deletePanel = async (req, res) => {
    const project = await Project.findById(req.params.pid);
    const panelId = req.params.panelId;

    // Buscar el id del panel en la lista de Project y eliminarlo
    let panelsOfProject = project.panels;
    let panelsLength = panelsOfProject.length;
    for (let i = 0; i < panelsLength; i++) {
        if (panelsOfProject[i].panel.toString() == panelId) {
            panelsOfProject.splice(i, 1);
            break;
        }
    }

    // Guardamos el Project con la lista actualizada
    await project.save();

    res.send({ message: `panel with id="${panelId}" has been removed from project with id="${project._id}"` });
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

projectController.getTags = async (req, res) => {
    const project = await Project.findById(req.params.id).populate({
        path: 'tags',
        populate: {
            path: 'tag'
        }
    });

    // rellenamos el array tags para enviarlo como respuesta
    let tags = [];
    for (let t of project.tags) {
        tags.push(t.tag);
    }

    return res.send(tags);
}

projectController.addTag = async (req, res) => {
    const project = await Project.findById(req.params.id);
    const tag = req.body;

    // Añadimos el tag a la lista de Project
    project.tags.push({
        tag: tag._id
    });

    await project.save();

    return res.send({ message: `tag with id="${tag._id}" has been added to project with id="${project._id}"` });
}

projectController.deleteTag = async (req, res) => {
    const project = await Project.findById(req.params.pid);
    const tagId = req.params.tid;

    // Buscar el id del tag en la lista de Project y eliminarlo
    let tagsOfProject = project.tags;
    let tPLength = tagsOfProject.length;
    for (let i = 0; i < tPLength; i++) {
        if (tagsOfProject[i].tag.toString() == tagId) {
            tagsOfProject.splice(i, 1);
            break;
        }
    }

    // Guardamos el Project con la lista actualizada
    await project.save();

    return res.send({ message: `tag with id="${tagId}" has been removed from project with id="${project._id}"` });
}

projectController.checkNameExistInUserList = async (uid, projectName) => {
    // Obtenemos el usuario con el uid
    const user = await User.findById(uid).populate({
        path: 'projects',
        populate: { path: 'project' }
    });

    // Recorremos los proyectos del usuario
    let userProjects = user.projects;
    for (let project of userProjects) {
        // si existe el projectName, devolvemos true
        if (project.project.name.toLowerCase() == projectName.toLowerCase()) return true;
    }

    // si no existe projectName en la lista de user
    return false;
}

module.exports = projectController;