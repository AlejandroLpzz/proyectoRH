const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. IMPORTAR EL MODELO
const Empleado = require('./models/Empleado');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error:', err));

// 2. RUTA DE PRUEBA PARA INSERTAR
app.get('/insertar-prueba', async (req, res) => {
    try {
        const nuevo = new Empleado({
            nombre: "Jose",
            departamento: "Sistemas",
            rol: "Administrador"
        });
        await nuevo.save();
        res.send("<h1>¡Éxito!</h1><p>Empleado de prueba guardado en MongoDB Atlas.</p>");
    } catch (error) {
        res.status(500).send("Error al guardar: " + error);
    }
});
// Ruta para OBTENER todos los empleados
app.get('/api/empleados', async (req, res) => {
    try {
        const empleados = await Empleado.find();
        res.json(empleados);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener empleados" });
    }
});
app.listen(3000, () => console.log('🚀 Servidor en puerto 3000'));