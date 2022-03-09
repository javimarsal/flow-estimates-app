const workItemController = {}

const WorkItem = require('../models/Work-item');

workItemController.getWorkItems = async (req, res) => {
    const workItems = await WorkItem.find();
    res.json(workItems)
}

workItemController.creatWorkItem = async (req, res) => {
    // Creamos el objeto con lo que nos manda el cliente (req)
    const newWorkItem = new WorkItem(req.body)
    
    // Guardamos el nuevo objeto
    let savedWorkItem = await newWorkItem.save();

    res.send(savedWorkItem);
}

workItemController.getWorkItem = async (req, res) => {
    const workItem = await WorkItem.findById(req.params.id)
    res.send(workItem)
}

workItemController.editWorkItem = async (req, res) => {
    await WorkItem.findByIdAndUpdate(req.params.id, req.body)
    res.send({ message: `Work item with id="${req.params.id}" updated` })
}

workItemController.deleteWorkItem = async (req, res) => {
    await WorkItem.findByIdAndDelete(req.params.id)
    res.send({ message: `Work item with id="${req.params.id}" deleted` })
}

module.exports = workItemController;