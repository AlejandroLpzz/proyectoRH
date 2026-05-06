const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexion a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error de conexión:', err));

// --- CONEXIÓN DE RUTAS ---
app.use('/api/empleados', require('./routes/empleado'));
app.use('/api/departamentos', require('./routes/departamento'));
app.use('/api/nomina', require('./routes/nomina'));
app.get('/crear-datos-prueba', async (req, res) => {
    res.send("Datos creados");
});

// Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});