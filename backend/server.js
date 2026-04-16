const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error de conexión:', err));

// --- CONEXIÓN DE RUTAS (Aquí usamos la nueva estructura MVC) ---
app.use('/api/empleados', require('./routes/empleado'));
app.use('/api/departamentos', require('./routes/departamento'));
app.use('/api/nomina', require('./routes/nomina'));

// (Opcional) Puedes dejar tu ruta de prueba si la sigues usando
app.get('/crear-datos-prueba', async (req, res) => {
    // ... tu código de prueba ...
    res.send("Datos creados");
});

// Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});