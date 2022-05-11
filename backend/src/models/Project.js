const { Schema, model } = require('mongoose');

const projectSchema = new Schema({
    name: {type: String, required: true},
    panels: [{
        panel: {type: Schema.Types.ObjectId, ref: 'panel'}
    }],
    workItems: [{
        workItem: {type: Schema.Types.ObjectId, ref: 'workitem'}
    }],
    tags: [{
        tag: {type: Schema.Types.ObjectId, ref: 'tag'}
    }]
},
{
    // Guardar fecha de creación y actualización
    timestamps: true,
    
    // Evita que al crear un objeto se añada un campo __v
    versionKey: false
})

module.exports = model('project', projectSchema);