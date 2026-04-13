const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. IMPORTAR LOS MODELOS
// Asegúrate de que los archivos en ./models/ existan con estos nombres exactos
const Empleado = require('./models/Empleado');
const Departamento = require('./models/Departamento');
const Nomina = require('./models/Nomina');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error de conexión:', err));

// --- RUTAS DE EMPLEADOS ---
app.get('/api/empleados', async (req, res) => {
    try {
        const empleados = await Empleado.find();
        res.json(empleados);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener empleados", error });
    }
});

// --- RUTAS DE DEPARTAMENTOS ---
app.get('/api/departamentos', async (req, res) => {
    try {
        const departamentos = await Departamento.find();
        // Mapeamos para incluir el conteo de empleados real
        const respuesta = await Promise.all(departamentos.map(async (dep) => {
            const conteo = await Empleado.countDocuments({ departamento: dep.nombre });
            return {
                ...dep._doc,
                numEmpleados: conteo
            };
        }));
        res.json(respuesta);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener departamentos" });
    }
});

// --- RUTAS DE NÓMINA ---
app.get('/api/nomina', async (req, res) => {
    try {
        // Trae los pagos y los ordena del más reciente al más antiguo
        const pagos = await Nomina.find().sort({ fecha: -1 });
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener nómina" });
    }
});

// --- RUTA DE PRUEBA ACTUALIZADA ---
app.get('/crear-datos-prueba', async (req, res) => {
    try {
        // 1. Crear/Actualizar Departamento
        await Departamento.findOneAndUpdate(
            { nombre: "Tecnología" }, 
            { responsable: "Carlos Slim", estado: "Activo" }, 
            { upsert: true, new: true }
        );

        // 2. Crear un Empleado para que el conteo no salga en 0
        await Empleado.findOneAndUpdate(
            { nombre: "Jose" },
            { departamento: "Tecnología", rol: "Desarrollador", estado: "Activo" },
            { upsert: true }
        );

        // 3. Crear un registro de Nómina
        const nuevoPago = new Nomina({
            empleado: "Jose",
            departamento: "Tecnología",
            monto: 2500,
            fecha: new Date(),
            estado: "Pagado"
        });
        await nuevoPago.save();

        res.send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h1 style="color: #10b981;">✅ ¡Datos de prueba creados!</h1>
                <p>Ya puedes revisar las tablas en tu sistema de RH.</p>
                <a href="http://localhost:3000/api/nomina" target="_blank">Ver JSON de Nómina</a>
            </div>
        `);
    } catch (error) {
        res.status(500).send("Error al crear datos: " + error.message);
    }
});

// Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});