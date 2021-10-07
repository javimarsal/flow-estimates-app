const panelController = {}

const Panel = require('../models/Panel');

panelController.getPanels = async (req, res) => {
    const panels = await Panel.find();
    res.json(panels)
}

panelController.creatPanel = async (req, res) => {
    // Creamos el objeto con lo que nos manda el cliente (req)
    const newPanel = new Panel(req.body)
    
    // Guardamos el nuevo objeto
    await newPanel.save()

    res.send({ message: 'Panel created' })
}

panelController.getPanel = async (req, res) => {
    const panel = await Panel.findById(req.params.id)
    res.send(panel)
}

panelController.editPanel = async (req, res) => {
    await Panel.findByIdAndUpdate(req.params.id, req.body)
    res.send({ message: 'Panel updated' })
}

panelController.deletePanel = async (req, res) => {
    await Panel.findByIdAndDelete(req.params.id)
    res.send({ message: 'Panel deleted' })
}

module.exports = panelController;