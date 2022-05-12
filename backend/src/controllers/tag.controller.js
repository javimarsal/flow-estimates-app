const tagController = {}

const Tag = require('../models/Tag');

tagController.getTags = async (req, res) => {
    const tags = await Tag.find();
    return res.json(tags);
}

tagController.createTag = async (req, res) => {
    // Creamos el objeto con lo que nos manda el cliente (req)
    const newTag = new Tag(req.body);

    // Guardamos el nuevo objeto
    const savedTag = await newTag.save();

    return res.send(savedTag);
}

tagController.getTag = async (req, res) => {
    const tag = await Tag.findById(req.params.id)
    return res.send(tag);
}

tagController.editTag = async (req, res) => {
    await Tag.findByIdAndUpdate(req.params.id, req.body);
    return res.send({ message: `Tag with id="${req.params.id}" updated` });
}

tagController.deleteTag = async (req, res) => {
    await Tag.findByIdAndDelete(req.params.id);
    return res.send({ message: `Tag with id="${req.params.id}" deleted` });
}

module.exports = tagController;