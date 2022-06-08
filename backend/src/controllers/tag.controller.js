const tagController = {}

const Tag = require('../models/Tag');
const Project = require('../models/Project');

tagController.getTags = async (req, res) => {
    const tags = await Tag.find();
    return res.json(tags);
}

tagController.createTag = async (req, res) => {
    // ID del proyecto en el que se encuentra el cliente
    // utilizado para evitar crear etiquetas con nombres duplicados
    const projectId = req.params.projectId;
    const tagName = req.body.name;

    // Solo guardar el Tag si el nombre no existe en las etiquetas existentes en el proyecto
    let tagNameExist = await tagController.checkNameExistInProjectList(projectId, tagName);

    // Si existe el nombre en la lista del proyecto, devolvemos undefined
    if (tagNameExist) return res.send(undefined);

    // Si no existe el nombre, creamos el objeto con lo que nos manda el cliente (req.body)
    const newTag = new Tag(req.body);

    // Guardamos el nuevo objeto
    await newTag.save();

    return res.send(newTag);
}

tagController.getTag = async (req, res) => {
    const tag = await Tag.findById(req.params.id);
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

tagController.checkNameExistInProjectList = async (projectId, tagName) => {
    // Obtenemos el proyecto con el projectId
    const project = await Project.findById(projectId).populate({
        path: 'tags',
        populate: { path: 'tag' }
    });

    // Recorremos las tags del proyecto
    let projectTags = project.tags;
    for (let tag of projectTags) {
        // Si algun nombre de las tags coincide con el tagName, devolvemos true
        if (tag.tag.name.toLowerCase() == tagName.toLowerCase()) return true;
    }

    // si no existe tagName en la lista del project
    return false;
}

module.exports = tagController;