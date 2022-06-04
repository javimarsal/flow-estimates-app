const panelController = {}

const Panel = require('../models/Panel');

panelController.getPanels = async (req, res) => {
    const panels = await Panel.find();
    return res.json(panels);
}

panelController.createPanel = async (req, res) => {
    // Creamos el objeto con lo que nos manda el cliente (req)
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

module.exports = panelController;