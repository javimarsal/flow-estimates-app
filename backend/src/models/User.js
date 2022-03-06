const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    email: {type: String, required: true},
    openedProject: {type: Schema.Types.ObjectId, ref: 'project'},
    projects: [{
        role: {type: String, required: true},
        project: {type: Schema.Types.ObjectId, ref: 'project'}
    }]
},
{
    // Guardar fecha de creación y actualización
    timestamps: true,
    
    // Evita que al crear un objeto se añada un campo __v
    versionKey: false
})

module.exports = model('user', userSchema);