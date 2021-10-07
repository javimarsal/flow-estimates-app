const { Schema, model }  = require('mongoose')

const panelSchema = new Schema({
    name: {type: String, required: true},
    position: {type: Number, required: true}
},
{
    // Guardar fecha de creación y actualización
    timestamps: true,
    
    // Evita que al crear un objeto se añada un campo __v
    versionKey: false
})

module.exports = model('panel', panelSchema);