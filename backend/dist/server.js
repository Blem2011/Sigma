"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql2_1 = __importDefault(require("mysql2"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar las variables de entorno desde el archivo .env
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares obligatorios
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
app.use(express_1.default.json());
// Configuración de la conexión a la base de datos MySQL con tipado seguro
const db = mysql2_1.default.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway'
});
// Conectar formalmente a MySQL
db.connect((err) => {
    if (err) {
        console.error('❌ Error crítico al conectar a MySQL:', err.message);
        return;
    }
    console.log('🚀 ¡Conectado exitosamente a la base de datos MySQL!');
});
// Ruta API de prueba para verificar la conexión desde el Frontend de React
app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: "¡El backend está funcionando y conectado!" });
});
// Ruta POST para el Login de la Constructora SIGMA
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    // Validación básica de campos vacíos
    if (!usuario || !password) {
        return res.status(400).json({ error: 'Por favor, completa todos los campos' });
    }
    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ?';
    db.query(query, [usuario, password], (err, results) => {
        if (err) {
            console.error('Error en login:', err.message);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        const filas = results;
        if (filas.length > 0) {
            // Si encontró coincidencia, enviamos los datos del usuario logueado
            const usuarioLogueado = filas[0];
            res.json({
                success: true,
                mensaje: '¡Ingreso exitoso!',
                user: { usuario: usuarioLogueado.usuario, rol: usuarioLogueado.rol }
            });
        }
        else {
            // Si las credenciales no coinciden
            res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
    });
});
// Ruta GET para obtener todos los usuarios (para listarlos en la tabla de React)
app.get('/api/usuarios', (req, res) => {
    const query = 'SELECT id, nombre_completo, usuario, rol, fecha_creacion FROM usuarios ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});
// Ruta POST para crear un nuevo usuario con rol específico
app.post('/api/usuarios', (req, res) => {
    const { nombre_completo, usuario, password, rol } = req.body;
    // Validación rápida de campos obligatorios
    if (!nombre_completo || !usuario || !password || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const query = 'INSERT INTO usuarios (nombre_completo, usuario, password, rol) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre_completo, usuario, password, rol], (err, result) => {
        if (err) {
            console.error('Error al insertar usuario:', err.message);
            // Validar si el nombre de usuario ya existe en la base de datos
            if (err.message.includes('ER_DUP_ENTRY')) {
                return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
            }
            return res.status(500).json({ error: 'Error al guardar el usuario' });
        }
        res.json({ success: true, mensaje: '¡Usuario creado exitosamente!' });
    });
});
// Ruta DELETE para eliminar un usuario por ID
app.delete('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM usuarios WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar usuario:', err.message);
            return res.status(500).json({ error: 'Error al intentar eliminar el usuario' });
        }
        res.json({ success: true, mensaje: '¡Usuario eliminado con éxito!' });
    });
});
// Ruta PUT para editar los datos de un usuario por ID
app.put('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_completo, usuario, password, rol } = req.body;
    if (!nombre_completo || !usuario || !rol) {
        return res.status(400).json({ error: 'Nombre, usuario y rol son obligatorios' });
    }
    // Si envían contraseña, la actualizamos; si no, dejamos la que estaba
    let query = '';
    let params = [];
    if (password && password.trim() !== '') {
        query = 'UPDATE usuarios SET nombre_completo = ?, usuario = ?, password = ?, rol = ? WHERE id = ?';
        params = [nombre_completo, usuario, password, rol, id];
    }
    else {
        query = 'UPDATE usuarios SET nombre_completo = ?, usuario = ?, rol = ? WHERE id = ?';
        params = [nombre_completo, usuario, rol, id];
    }
    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error al editar usuario:', err.message);
            if (err.message.includes('ER_DUP_ENTRY')) {
                return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
            }
            return res.status(500).json({ error: 'Error al actualizar el usuario' });
        }
        res.json({ success: true, mensaje: '¡Usuario actualizado con éxito!' });
    });
});
// 1. Obtener todos los clientes
app.get('/api/clientes', (req, res) => {
    const query = 'SELECT * FROM clientes ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener clientes:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});
// 2. Crear un nuevo cliente
app.post('/api/clientes', (req, res) => {
    const { nombre, telefono, cuit, direccion, tipo } = req.body;
    if (!nombre || !cuit || !tipo) {
        return res.status(400).json({ error: 'Nombre, CUIT y Tipo son obligatorios' });
    }
    const query = 'INSERT INTO clientes (nombre, telefono, cuit, direccion, tipo) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nombre, telefono, cuit, direccion, tipo], (err, result) => {
        if (err) {
            console.error('Error al insertar cliente:', err.message);
            if (err.message.includes('ER_DUP_ENTRY')) {
                return res.status(400).json({ error: 'El CUIT ya está registrado en el sistema' });
            }
            return res.status(500).json({ error: 'Error al guardar el cliente' });
        }
        res.json({ success: true, mensaje: '¡Cliente creado exitosamente!' });
    });
});
// 3. Editar un cliente por ID
app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, cuit, direccion, tipo } = req.body;
    if (!nombre || !cuit || !tipo) {
        return res.status(400).json({ error: 'Nombre, CUIT y Tipo son obligatorios' });
    }
    const query = 'UPDATE clientes SET nombre = ?, telefono = ?, cuit = ?, direccion = ?, tipo = ? WHERE id = ?';
    db.query(query, [nombre, telefono, cuit, direccion, tipo, id], (err, result) => {
        if (err) {
            console.error('Error al editar cliente:', err.message);
            if (err.message.includes('ER_DUP_ENTRY')) {
                return res.status(400).json({ error: 'El CUIT ya pertenece a otro cliente' });
            }
            return res.status(500).json({ error: 'Error al actualizar el cliente' });
        }
        res.json({ success: true, mensaje: '¡Cliente actualizado con éxito!' });
    });
});
// 4. Eliminar un cliente por ID
app.delete('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM clientes WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar cliente:', err.message);
            return res.status(500).json({ error: 'Error al intentar eliminar el cliente' });
        }
        res.json({ success: true, mensaje: '¡Cliente eliminado con éxito!' });
    });
});
// 1. Obtener todos los proveedores
app.get('/api/proveedores', (req, res) => {
    const query = 'SELECT * FROM proveedores ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener proveedores:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});
// 2. Crear un nuevo proveedor
app.post('/api/proveedores', (req, res) => {
    const { nombre, telefono, cuit, direccion, tipo } = req.body;
    if (!nombre || !cuit || !tipo) {
        return res.status(400).json({ error: 'Nombre, CUIT y Tipo son obligatorios' });
    }
    const query = 'INSERT INTO proveedores (nombre, telefono, cuit, direccion, tipo) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nombre, telefono, cuit, direccion, tipo], (err, result) => {
        if (err) {
            console.error('Error al insertar proveedor:', err.message);
            if (err.message.includes('ER_DUP_ENTRY')) {
                return res.status(400).json({ error: 'El CUIT ya está registrado para otro proveedor' });
            }
            return res.status(500).json({ error: 'Error al guardar el proveedor' });
        }
        res.json({ success: true, mensaje: '¡Proveedor creado exitosamente!' });
    });
});
// 3. Editar un proveedor por ID
app.put('/api/proveedores/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, cuit, direccion, tipo } = req.body;
    if (!nombre || !cuit || !tipo) {
        return res.status(400).json({ error: 'Nombre, CUIT y Tipo son obligatorios' });
    }
    const query = 'UPDATE proveedores SET nombre = ?, telefono = ?, cuit = ?, direccion = ?, tipo = ? WHERE id = ?';
    db.query(query, [nombre, telefono, cuit, direccion, tipo, id], (err, result) => {
        if (err) {
            console.error('Error al editar proveedor:', err.message);
            if (err.message.includes('ER_DUP_ENTRY')) {
                return res.status(400).json({ error: 'El CUIT ya pertenece a otro proveedor' });
            }
            return res.status(500).json({ error: 'Error al actualizar el proveedor' });
        }
        res.json({ success: true, mensaje: '¡Proveedor actualizado con éxito!' });
    });
});
// 4. Eliminar un proveedor por ID
app.delete('/api/proveedores/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM proveedores WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar proveedor:', err.message);
            return res.status(500).json({ error: 'Error al intentar eliminar el proveedor' });
        }
        res.json({ success: true, mensaje: '¡Proveedor eliminado con éxito!' });
    });
});
// 1. Obtener todos los materiales
app.get('/api/materiales', (req, res) => {
    const query = 'SELECT * FROM materiales ORDER BY nombre ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener materiales:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});
// 2. Crear un nuevo material
app.post('/api/materiales', (req, res) => {
    const { nombre, cantidad, unidad_medida, stock_minimo } = req.body;
    if (!nombre || cantidad === undefined || !unidad_medida || stock_minimo === undefined) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const query = 'INSERT INTO materiales (nombre, cantidad, unidad_medida, stock_minimo) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, cantidad, unidad_medida, stock_minimo], (err, result) => {
        if (err) {
            console.error('Error al insertar material:', err.message);
            if (err.message.includes('ER_DUP_ENTRY')) {
                return res.status(400).json({ error: 'Este material ya se encuentra registrado' });
            }
            return res.status(500).json({ error: 'Error al guardar el material' });
        }
        res.json({ success: true, mensaje: '¡Material registrado exitosamente!' });
    });
});
// 3. Editar o actualizar stock de un material por ID
app.put('/api/materiales/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, cantidad, unidad_medida, stock_minimo } = req.body;
    if (!nombre || cantidad === undefined || !unidad_medida || stock_minimo === undefined) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const query = 'UPDATE materiales SET nombre = ?, cantidad = ?, unidad_medida = ?, stock_minimo = ? WHERE id = ?';
    db.query(query, [nombre, cantidad, unidad_medida, stock_minimo, id], (err, result) => {
        if (err) {
            console.error('Error al editar material:', err.message);
            return res.status(500).json({ error: 'Error al actualizar el material' });
        }
        res.json({ success: true, mensaje: '¡Inventario actualizado con éxito!' });
    });
});
// 4. Eliminar un material por ID
app.delete('/api/materiales/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM materiales WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar material:', err.message);
            return res.status(500).json({ error: 'Error al intentar eliminar el material' });
        }
        res.json({ success: true, mensaje: '¡Material eliminado con éxito!' });
    });
});
// 1. Obtener el historial de compras con nombres de proveedor y material
app.get('/api/compras', (req, res) => {
    const query = `
    SELECT c.id, c.cantidad, c.precio_unitario, c.fecha_compra, 
           p.nombre AS proveedor, m.nombre AS material, m.unidad_medida
    FROM compras c
    INNER JOIN proveedores p ON c.id_proveedor = p.id
    INNER JOIN materiales m ON c.id_material = m.id
    ORDER BY c.id DESC
  `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener compras:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});
// 2. Registrar una compra y sumar automáticamente al almacén (Transaccional)
app.post('/api/compras', (req, res) => {
    const { id_proveedor, id_material, cantidad, precio_unitario } = req.body;
    if (!id_proveedor || !id_material || !cantidad || !precio_unitario) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    // Iniciamos una transacción SQL para asegurar que ambas operaciones ocurran juntas
    db.beginTransaction((err) => {
        if (err)
            return res.status(500).json({ error: 'Error al iniciar la transacción' });
        // Paso A: Insertar el registro en la tabla de compras
        const qInsertCompra = 'INSERT INTO compras (id_proveedor, id_material, cantidad, precio_unitario) VALUES (?, ?, ?, ?)';
        db.query(qInsertCompra, [id_proveedor, id_material, cantidad, precio_unitario], (errInsert) => {
            if (errInsert) {
                return db.rollback(() => {
                    console.error('Error al insertar compra:', errInsert.message);
                    res.status(500).json({ error: 'Error al registrar la compra' });
                });
            }
            // Paso B: Sumar la cantidad al stock actual en la tabla materiales
            const qUpdateStock = 'UPDATE materiales SET cantidad = cantidad + ? WHERE id = ?';
            db.query(qUpdateStock, [cantidad, id_material], (errUpdate) => {
                if (errUpdate) {
                    return db.rollback(() => {
                        console.error('Error al actualizar stock:', errUpdate.message);
                        res.status(500).json({ error: 'Error al impactar el stock en almacén' });
                    });
                }
                // Si todo salió bien, confirmamos los cambios de forma definitiva
                db.commit((errCommit) => {
                    if (errCommit) {
                        return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la transacción' }));
                    }
                    res.json({ success: true, mensaje: '¡Compra registrada y stock actualizado con éxito!' });
                });
            });
        });
    });
});
// 1. Obtener todas las obras con el nombre de su cliente
app.get('/api/obras', (req, res) => {
    const query = `
    SELECT o.*, c.nombre AS cliente_nombre 
    FROM obras o
    INNER JOIN clientes c ON o.id_cliente = c.id
    ORDER BY o.id DESC
  `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener obras:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});
// 2. Crear una nueva obra
app.post('/api/obras', (req, res) => {
    const { id_cliente, nombre, direccion, presupuesto, fecha_inicio, estado } = req.body;
    if (!id_cliente || !nombre || !direccion || !presupuesto || !fecha_inicio || !estado) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const query = 'INSERT INTO obras (id_cliente, nombre, direccion, presupuesto, fecha_inicio, estado) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [id_cliente, nombre, direccion, presupuesto, fecha_inicio, estado], (err, result) => {
        if (err) {
            console.error('Error al insertar obra:', err.message);
            return res.status(500).json({ error: 'Error al registrar la obra' });
        }
        res.json({ success: true, mensaje: '¡Obra registrada con éxito!' });
    });
});
// 3. Editar una obra por ID
app.put('/api/obras/:id', (req, res) => {
    const { id } = req.params;
    const { id_cliente, nombre, direccion, presupuesto, fecha_inicio, estado } = req.body;
    if (!id_cliente || !nombre || !direccion || !presupuesto || !fecha_inicio || !estado) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const query = 'UPDATE obras SET id_cliente = ?, nombre = ?, direccion = ?, presupuesto = ?, fecha_inicio = ?, estado = ? WHERE id = ?';
    db.query(query, [id_cliente, nombre, direccion, presupuesto, fecha_inicio, estado, id], (err, result) => {
        if (err) {
            console.error('Error al editar obra:', err.message);
            return res.status(500).json({ error: 'Error al actualizar la obra' });
        }
        res.json({ success: true, mensaje: '¡Obra actualizada con éxito!' });
    });
});
// 4. Eliminar una obra por ID
app.delete('/api/obras/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM obras WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar obra:', err.message);
            return res.status(500).json({ error: 'Error al intentar eliminar la obra' });
        }
        res.json({ success: true, mensaje: '¡Obra eliminada con éxito!' });
    });
});
// 1. Obtener el historial de consumos con nombres de obra y material
app.get('/api/consumos', (req, res) => {
    const query = `
    SELECT c.id, c.cantidad, c.fecha_consumo, 
           o.nombre AS obra, m.nombre AS material, m.unidad_medida
    FROM consumos c
    INNER JOIN obras o ON c.id_obra = o.id
    INNER JOIN materiales m ON c.id_material = m.id
    ORDER BY c.id DESC
  `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener consumos:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});
// 2. Registrar consumo y restar del almacén con validación de stock
app.post('/api/consumos', (req, res) => {
    const { id_obra, id_material, cantidad } = req.body;
    if (!id_obra || !id_material || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios y mayores a cero' });
    }
    // Verificar primero si hay stock suficiente en depósito
    const qVerificarStock = 'SELECT cantidad, nombre FROM materiales WHERE id = ?';
    db.query(qVerificarStock, [id_material], (errCheck, resultsCheck) => {
        if (errCheck)
            return res.status(500).json({ error: 'Error al verificar stock' });
        const filas = resultsCheck;
        if (filas.length === 0)
            return res.status(404).json({ error: 'Material no encontrado' });
        const stockDisponible = Number(filas[0].cantidad);
        const nombreMaterial = filas[0].nombre;
        if (stockDisponible < Number(cantidad)) {
            return res.status(400).json({
                error: `Stock insuficiente de ${nombreMaterial}. Disponible: ${stockDisponible}`
            });
        }
        // Si hay stock, iniciamos la transacción
        db.beginTransaction((errTx) => {
            if (errTx)
                return res.status(500).json({ error: 'Error al iniciar la transacción' });
            // Paso A: Guardar el remito en la tabla consumos
            const qInsertConsumo = 'INSERT INTO consumos (id_obra, id_material, cantidad) VALUES (?, ?, ?)';
            db.query(qInsertConsumo, [id_obra, id_material, cantidad], (errInsert) => {
                if (errInsert) {
                    return db.rollback(() => res.status(500).json({ error: 'Error al registrar el consumo' }));
                }
                // Paso B: Restar la cantidad de la tabla materiales
                const qRestarStock = 'UPDATE materiales SET cantidad = cantidad - ? WHERE id = ?';
                db.query(qRestarStock, [cantidad, id_material], (errUpdate) => {
                    if (errUpdate) {
                        return db.rollback(() => res.status(500).json({ error: 'Error al actualizar el almacén' }));
                    }
                    // Confirmar cambios
                    db.commit((errCommit) => {
                        if (errCommit)
                            return db.rollback(() => res.status(500).json({ error: 'Error al confirmar' }));
                        res.json({ success: true, mensaje: '¡Consumo registrado y stock descontado con éxito!' });
                    });
                });
            });
        });
    });
});
// 1. Obtener todos los empleados con el nombre de su obra (si tienen)
app.get('/api/empleados', (req, res) => {
    const query = `
    SELECT e.*, o.nombre AS obra_nombre 
    FROM empleados e
    LEFT JOIN obras o ON e.id_obra = o.id
    ORDER BY e.id DESC
  `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener empleados:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});
// 2. Crear un nuevo empleado
app.post('/api/empleados', (req, res) => {
    const { id_obra, nombre_completo, dni, telefono, specialty, especialidad } = req.body;
    // Soportamos especialidad mandada como 'especialidad' o 'specialty' por si acaso
    const esp = especialidad || specialty;
    if (!nombre_completo || !dni || !esp) {
        return res.status(400).json({ error: 'Nombre, DNI y Especialidad son obligatorios' });
    }
    // Si id_obra viene vacío o es 0, guardamos NULL
    const obraId = id_obra ? Number(id_obra) : null;
    const query = 'INSERT INTO empleados (id_obra, nombre_completo, dni, telefono, especialidad) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [obraId, nombre_completo, dni, telefono, esp], (err, result) => {
        if (err) {
            console.error('Error al insertar empleado:', err.message);
            if (err.message.includes('ER_DUP_ENTRY')) {
                return res.status(400).json({ error: 'El DNI ya pertenece a un empleado registrado' });
            }
            return res.status(500).json({ error: 'Error al registrar al empleado' });
        }
        res.json({ success: true, mensaje: '¡Empleado registrado con éxito!' });
    });
});
// 3. Editar un empleado por ID
app.put('/api/empleados/:id', (req, res) => {
    const { id } = req.params;
    const { id_obra, nombre_completo, dni, telefono, especialidad } = req.body;
    if (!nombre_completo || !dni || !especialidad) {
        return res.status(400).json({ error: 'Nombre, DNI y Especialidad son obligatorios' });
    }
    const obraId = id_obra ? Number(id_obra) : null;
    const query = 'UPDATE empleados SET id_obra = ?, nombre_completo = ?, dni = ?, telefono = ?, especialidad = ? WHERE id = ?';
    db.query(query, [obraId, nombre_completo, dni, telefono, especialidad, id], (err, result) => {
        if (err) {
            console.error('Error al editar empleado:', err.message);
            if (err.message.includes('ER_DUP_ENTRY')) {
                return res.status(400).json({ error: 'El DNI ingresado ya está asignado a otra persona' });
            }
            return res.status(500).json({ error: 'Error al actualizar datos del empleado' });
        }
        res.json({ success: true, mensaje: '¡Datos del empleado actualizados con éxito!' });
    });
});
// 4. Eliminar un empleado por ID
app.delete('/api/empleados/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM empleados WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar empleado:', err.message);
            return res.status(500).json({ error: 'Error al intentar dar de baja al empleado' });
        }
        res.json({ success: true, mensaje: '¡Empleado dado de baja con éxito!' });
    });
});
// 1. Obtener historial de asistencias con nombres de los empleados
app.get('/api/asistencias', (req, res) => {
    const query = `
    SELECT a.*, e.nombre_completo AS empleado_nombre, e.especialidad
    FROM asistencias a
    INNER JOIN empleados e ON a.id_empleado = e.id
    ORDER BY a.fecha DESC, a.id DESC
  `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener asistencias:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});
// 2. Registrar o actualizar la asistencia de un empleado
app.post('/api/asistencias', (req, res) => {
    const { id_empleado, fecha, estado, hora_entrada, hora_salida, observaciones } = req.body;
    if (!id_empleado || !fecha || !estado) {
        return res.status(400).json({ error: 'Empleado, fecha y estado son obligatorios' });
    }
    // Usamos INSERT INTO ... ON DUPLICATE KEY UPDATE por si quieren corregir la asistencia del mismo día
    const query = `
    INSERT INTO asistencias (id_empleado, fecha, estado, hora_entrada, hora_salida, observaciones) 
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      estado = VALUES(estado), 
      hora_entrada = VALUES(hora_entrada), 
      hora_salida = VALUES(hora_salida), 
      observaciones = VALUES(observaciones)
  `;
    // Si vienen vacíos los horarios por falta, guardamos NULL
    const entrada = hora_entrada || null;
    const salida = hora_salida || null;
    const obs = observaciones || null;
    db.query(query, [id_empleado, fecha, estado, entrada, salida, obs], (err, result) => {
        if (err) {
            console.error('Error al registrar asistencia:', err.message);
            return res.status(500).json({ error: 'Error al guardar el presentismo' });
        }
        res.json({ success: true, mensaje: '¡Asistencia registrada con éxito!' });
    });
});
// Forzamos que PORT sea estrictamente un número para cumplir con TypeScript
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Servidor Express activo y escuchando en el puerto ${PORT}`);
});
//# sourceMappingURL=server.js.map