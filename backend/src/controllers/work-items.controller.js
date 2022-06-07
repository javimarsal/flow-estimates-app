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

workItemController.getTags = async (req, res) => {
    const workItem = await WorkItem.findById(req.params.id).populate({
        path: 'tags',
        populate: {
            path: 'tag'
        }
    });

    // rellenamos el array tags para enviarlo como respuesta
    let tags = [];
    for (let t of workItem.tags) {
        tags.push(t.tag);
    }

    return res.send(tags);
}

workItemController.addTag = async (req, res) => {
    const workItem = await WorkItem.findById(req.params.id);
    const tag = req.body;

    // Añadimos el tag a la lista de WorkItem
    workItem.tags.push({
        tag: tag._id
    });

    await workItem.save();

    return res.send({ message: `tag with id="${tag._id}" has been added to workItem with id="${workItem._id}"` });
}

workItemController.deleteTag = async (req, res) => {
    const workItem = await WorkItem.findById(req.params.wid);
    const tagId = req.params.tid;

    // Buscar el id del tag en la lista de WorkItem y eliminarlo
    let tagsOfWorkItem = workItem.tags;
    let tWLength = tagsOfWorkItem.length;
    for (let i = 0; i < tWLength; i++) {
        if (tagsOfWorkItem[i].tag.toString() == tagId) {
            tagsOfWorkItem.splice(i, 1);
            // Guardamos el WorkItem con la lista actualizada
            await workItem.save();
            break;
        }
    }

    return res.send({ message: `tag with id="${tagId}" has been removed from workItem with id="${workItem._id}"` });
}

module.exports = workItemController;