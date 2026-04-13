const mongoose = require('mongoose');

const DepartamentoSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true, 
        unique: true // Evita duplicados como "Marketing" dos veces
    },
    responsable: { 
        type: String, 
        required: true 
    },
    descripcion: { 
        type: String 
    },
    estado: { 
        type: String, 
        enum: ['Activo', 'Inactivo'], 
        default: 'Activo' 
    },
    fechaCreacion: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Departamento', DepartamentoSchema);