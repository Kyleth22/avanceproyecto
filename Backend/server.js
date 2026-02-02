const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

//MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

//MIDDLEWARE DE AUTENTICACIÓN (verificarToken)
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "No se proporcionó un token." });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token inválido o expirado." });
        req.usuarioId = decoded.id; 
        next();
    });
};

//RUTAS DE USUARIO (Registro, Login, Perfil)

app.post('/api/registro', async (req, res, next) => {
    const { usuario, correo, password, direccion } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const query = 'INSERT INTO usuarios (nombre_usuario, email, password, direccion) VALUES (?, ?, ?, ?)';
        await db.query(query, [usuario, correo, hashedPassword, direccion]);
        res.status(201).json({ status: 'success', message: 'Usuario creado correctamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'El correo ya existe.' });
        next(error);
    }
});

app.post('/api/login', async (req, res, next) => {
    const { correo, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [correo]);
        if (rows.length === 0) return res.status(401).json({ message: "Credenciales incorrectas." });

        const usuario = rows[0];
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) return res.status(401).json({ message: "Credenciales incorrectas." });

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ status: 'success', token, usuario: { id: usuario.id, nombre: usuario.nombre_usuario } });
    } catch (error) { next(error); }
});

app.get('/api/perfil', verificarToken, async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT nombre_usuario, email, direccion FROM usuarios WHERE id = ?', [req.usuarioId]);
        res.json(rows[0]);
    } catch (error) { next(error); }
});

//RUTAS DE PRODUCTOS Y CARRITO

app.get('/api/productos', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) { next(error); }
});

app.get('/api/carrito-usuario', verificarToken, async (req, res, next) => {
    try {
        const query = `
            SELECT c.producto_id, c.cantidad, p.nombre, p.precio, p.imagen_url 
            FROM carrito c 
            JOIN productos p ON c.producto_id = p.id 
            WHERE c.usuario_id = ?`;
        const [rows] = await db.query(query, [req.usuarioId]);
        res.json(rows);
    } catch (error) { next(error); }
});

app.post('/api/carrito', verificarToken, async (req, res, next) => {
    const { producto_id } = req.body;
    try {
        const query = `
            INSERT INTO carrito (usuario_id, producto_id, cantidad) 
            VALUES (?, ?, 1) 
            ON DUPLICATE KEY UPDATE cantidad = cantidad + 1`;
        await db.query(query, [req.usuarioId, producto_id]);
        res.json({ status: 'success', message: "Carrito actualizado" });
    } catch (error) { next(error); }
});

app.put('/api/carrito/cantidad', verificarToken, async (req, res, next) => {
    const { producto_id, cantidad } = req.body;
    try {
        await db.query('UPDATE carrito SET cantidad = ? WHERE usuario_id = ? AND producto_id = ?', [cantidad, req.usuarioId, producto_id]);
        res.json({ message: "Cantidad actualizada" });
    } catch (error) { next(error); }
});

app.delete('/api/carrito/:id', verificarToken, async (req, res, next) => {
    try {
        await db.query('DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ?', [req.usuarioId, req.params.id]);
        res.json({ message: "Eliminado del carrito" });
    } catch (error) { next(error); }
});

//RUTAS DE LISTA DE DESEOS

app.get('/api/deseos-usuario', verificarToken, async (req, res, next) => {
    try {
        const query = `
            SELECT p.* FROM productos p
            INNER JOIN deseos d ON p.id = d.producto_id
            WHERE d.usuario_id = ?`;
        const [rows] = await db.query(query, [req.usuarioId]);
        res.json(rows);
    } catch (error) { next(error); }
});

app.post('/api/deseos', verificarToken, async (req, res, next) => {
    const { producto_id } = req.body;
    try {
        const query = 'INSERT IGNORE INTO deseos (usuario_id, producto_id) VALUES (?, ?)';
        await db.query(query, [req.usuarioId, producto_id]);
        res.json({ status: 'success', message: "Añadido a deseos" });
    } catch (error) { next(error); }
});

app.delete('/api/deseos/:productoId', verificarToken, async (req, res, next) => {
    try {
        await db.query('DELETE FROM deseos WHERE usuario_id = ? AND producto_id = ?', [req.usuarioId, req.params.productoId]);
        res.json({ status: 'success', message: 'Eliminado de deseos' });
    } catch (error) { next(error); }
});

//RUTA DE RECOMENDACIONES
app.post('/api/recomendaciones', async (req, res, next) => {
    const { nombre, correo, tipo, mensaje } = req.body;
    try {
        const query = 'INSERT INTO recomendaciones (nombre, correo, tipo_recomendacion, mensaje) VALUES (?, ?, ?, ?)';
        await db.query(query, [nombre, correo, tipo, mensaje]);
        res.status(201).json({ status: 'success', message: '¡Recomendación guardada!' });
    } catch (error) { next(error); }
});
// --- RUTA: REGISTRAR PEDIDO ---
app.post('/api/pedidos', verificarToken, async (req, res, next) => {
    const { total } = req.body;
    const usuario_id = req.usuarioId;
    // Generamos un código estilo LP-2026-XXXXX
    const codigo_pedido = `LP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
        const query = 'INSERT INTO pedidos (usuario_id, codigo_pedido, total, fecha_pedido) VALUES (?, ?, ?, NOW())';
        const [result] = await db.query(query, [usuario_id, codigo_pedido, total]);

        res.status(201).json({ 
            status: 'success', 
            codigo: codigo_pedido 
        });
    } catch (error) {
        next(error);
    }
});

//MANEJADOR DE ERRORES GLOBAL
app.use((err, req, res, next) => {
    console.error("Error detectado:", err.message);
    res.status(500).json({
        status: 'error',
        message: 'Algo salió mal en el servidor',
        detalles: err.message
    });
});
app.delete('/api/carrito-vaciar', verificarToken, async (req, res, next) => {
    try {
        await db.query('DELETE FROM carrito WHERE usuario_id = ?', [req.usuarioId]);
        res.json({ message: "Carrito vaciado" });
    } catch (error) { next(error); }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend de LE PARFUM listo en puerto ${PORT}`);
});