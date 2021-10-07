const workitemController = {}

const Workitem = require('../models/Work-item');

workitemController.getWorkitems = async (req, res) => {
    const workitems = await Workitem.find();
    res.json(workitems)
}

workitemController.creatWorkitem = async (req, res) => {
    // Creamos el objeto con lo que nos manda el cliente (req)
    const newWorkitem = new Workitem(req.body)
    
    // Guardamos el nuevo objeto
    await newWorkitem.save()

    res.send({ message: 'Work item created' })
}

workitemController.getWorkitem = async (req, res) => {
    const workitem = await Workitem.findById(req.params.id)
    res.send(workitem)
}

workitemController.editWorkitem = async (req, res) => {
    await Workitem.findByIdAndUpdate(req.params.id, req.body)
    res.send({ message: 'Work item updated' })
}

workitemController.deleteWorkitem = async (req, res) => {
    await Workitem.findByIdAndDelete(req.params.id)
    res.send({ message: 'Work item deleted' })
}

module.exports = workitemController;