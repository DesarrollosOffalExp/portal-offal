const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { poolPromise, sql } = require('./config/db');
const auth = require('./middlewares/auth');
const CATALOGO = require('./config/apps');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors({ credentials: true }));
app.use(express.json());

// Frontend compilado (React).
app.use(express.static(path.join(__dirname, 'client/dist')));

// Health check público para el probe del App Service.
app.get('/health', async (req, res) => {
  try {
    const pool = await poolPromise;
    res.status(pool ? 200 : 503).json({ status: pool ? 'ok' : 'degraded', db: !!pool });
  } catch {
    res.status(503).json({ status: 'degraded', db: false });
  }
});

/**
 * GET /api/me — identidad + secciones a las que la persona puede entrar.
 * Cruza acceso.Permisos (del usuario) con el catálogo de apps del portal.
 */
app.get('/api/me', auth, async (req, res) => {
  try {
    let permisos = [];
    if (req.user.registrado) {
      const pool = await poolPromise;
      const r = await pool.request()
        .input('uid', sql.Int, req.user.UsuarioId)
        .query(`SELECT App, Rol FROM acceso.Permisos WHERE UsuarioId = @uid`);
      permisos = r.recordset;
    }

    // Solo las apps del catálogo para las que tiene permiso, en el orden del catálogo.
    const rolPorApp = new Map(permisos.map((p) => [p.App, p.Rol]));
    const apps = CATALOGO
      .filter((a) => rolPorApp.has(a.key))
      .map((a) => ({
        key: a.key,
        nombre: a.nombre,
        descripcion: a.descripcion,
        url: a.url,
        acento: a.acento,
        rol: rolPorApp.get(a.key),
      }));

    res.json({
      usuario: {
        nombre: req.user.Nombre,
        email: req.user.Email,
        registrado: req.user.registrado,
      },
      apps,
    });
  } catch (err) {
    console.error('[Portal] /api/me error:', err.message);
    res.status(500).json({ mensaje: 'No se pudieron cargar tus accesos.' });
  }
});

// SPA fallback.
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('El frontend aún no fue compilado. Ejecute: npm run client:build');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Portal Offal en http://localhost:${PORT}`);
});
