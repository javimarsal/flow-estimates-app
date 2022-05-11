const { Schema, model }  = require('mongoose')

const workItemSchema = new Schema({
    idNumber: {type: Number, required: true},
    title: {type: String, required: true},
    description: {type: String, required: false},
    panel: {type: String, required: true},
    position: {type: Number, required: true},
    panelDateRegistry: [{
        panel: {type: String, required: true},
        date: {type: Date, required: true}
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

module.exports = model('workitem', workItemSchema);