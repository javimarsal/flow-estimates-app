const { Schema, model }  = require('mongoose')

const workitemSchema = new Schema({
    name: {type: String, required: true},
    panel: {type: String, required: true},
    position: {type: Number, required: true}
},
{
    // Guardar fecha de creación y actualización
    timestamps: true,
    
    // Evita que al crear un objeto se añada un campo __v
    versionKey: false
})

module.exports = model('Work-item', workitemSchema);