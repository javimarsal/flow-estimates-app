const { Schema, model } = require('mongoose');

const tagSchema = new Schema({
    name: {type: String, required: true},
    color: {type: String}
},
{
    // Guardar fecha de creación y actualización
    timestamps: true,
    
    // Evita que al crear un objeto se añada un campo __v
    versionKey: false
})

module.exports = model('tag', tagSchema);