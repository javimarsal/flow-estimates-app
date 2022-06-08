const panelController = {}

const Panel = require('../models/Panel');
const Project = require('../models/Project');

panelController.getPanels = async (req, res) => {
    const panels = await Panel.find();
    return res.json(panels);
}

panelController.createPanel = async (req, res) => {
    // ID del proyecto en el que se encuentra el cliente
    // utilizado para evitar crear paneles con nombres duplicados
    const projectId = req.params.projectId;
    const panelName = req.body.name;

    // Solo guardar el Panel si el nombre no existe en los paneles existentes en el proyecto
    let panelNameExist = await panelController.checkNameExistInProjectList(projectId, panelName);

    // Si existe el nombre en la lista del proyecto, devolvemos undefined
    if (panelNameExist) return res.send(undefined);

    // Si no existe el nombre, creamos el objeto con lo que nos manda el cliente (req.body)
    const newPanel = new Panel(req.body);
    
    // Guardamos el nuevo objeto
    await newPanel.save();

    return res.send(newPanel);
}

panelController.getPanel = async (req, res) => {
    const panel = await Panel.findById(req.params.id);
    return res.send(panel);
}

panelController.editPanel = async (req, res) => {
    await Panel.findByIdAndUpdate(req.params.id, req.body);
    return res.send({ message: `Panel with id="${req.params.id}" updated` });
}

panelController.deletePanel = async (req, res) => {
    await Panel.findByIdAndDelete(req.params.id);
    return res.send({ message: `Panel with id="${req.params.id}" deleted` });
}

panelController.checkNameExistInProjectList = async (projectId, panelName) => {
    // Obtenemos el proyecto con el projectId
    const project = await Project.findById(projectId).populate({
        path: 'panels',
        populate: { path: 'panel' }
    });

    // Recorremos los panels del proyecto
    let projectPanels = project.panels;
    for (let panel of projectPanels) {
        // Si algún nombre de los panels coincide con el panelName, devolvemos true
        if (panel.panel.name.toLowerCase() == panelName.toLowerCase()) return true;
    }

    // si no existe panelName en la lista del project
    return false;
}

module.exports = panelController;