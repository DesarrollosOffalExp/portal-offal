const { poolPromise, sql } = require('../config/db');
require('dotenv').config();

/**
 * Identidad del portal vía Azure Easy Auth (Entra ID).
 *
 * Easy Auth reenvía el email del usuario ya autenticado en la cabecera
 * 'x-ms-client-principal-name'. A diferencia de cada app, el portal NO exige un
 * permiso puntual: alcanza con estar autenticado. Si la persona todavía no está
 * en el padrón (o no tiene secciones), igual entra y ve un mensaje — así se evita
 * el loop de login que sufría quien no tenía permisos cargados.
 *
 * En desarrollo simula un usuario real (DEV_EMAIL) para ver el padrón de verdad.
 */
/**
 * Los invitados (B2B) de Entra pueden llegar identificados como
 *   "persona_dominio.com#EXT#@offal.onmicrosoft.com"
 * en vez de su correo real. Como en acceso.Usuarios se carga el correo de
 * siempre (persona@dominio.com), reconstruimos ese formato para poder cruzarlo.
 * Devuelve null si el email no tiene forma de invitado.
 */
function correoDeInvitado(email) {
  const i = email.indexOf('#EXT#');
  if (i === -1) return null;
  const base = email.slice(0, i);            // persona_dominio.com
  const guion = base.lastIndexOf('_');       // el último "_" era la arroba
  return guion === -1 ? null : `${base.slice(0, guion)}@${base.slice(guion + 1)}`;
}

module.exports = async function auth(req, res, next) {
  const email =
    req.headers['x-ms-client-principal-name'] ||
    (process.env.NODE_ENV !== 'production'
      ? process.env.DEV_EMAIL || 'roberto.sanabria@offal.com.ar'
      : null);

  if (!email) {
    return res.status(401).json({ mensaje: 'No autenticado por Azure Easy Auth.' });
  }

  try {
    const pool = await poolPromise;
    if (!pool) throw new Error('No hay conexión con la base de datos');

    // Identidad en el padrón. Si no está, se entra como identidad-solo (sin secciones).
    // Se busca por el email que manda Easy Auth y, si es un invitado de Entra,
    // también por su correo real (ver correoDeInvitado).
    const alterno = correoDeInvitado(email);
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('alterno', sql.NVarChar, alterno || email)
      .query(`
        SELECT UsuarioId, Email, Nombre
        FROM acceso.Usuarios
        WHERE Activo = 1 AND Email IN (@email, @alterno)
      `);

    const u = result.recordset[0];
    req.user = u
      ? { UsuarioId: u.UsuarioId, Email: u.Email, Nombre: u.Nombre, registrado: true }
      : { UsuarioId: null, Email: email, Nombre: null, registrado: false };

    next();
  } catch (err) {
    console.error('[Portal/Auth] Error:', err.message);
    return res.status(500).json({ mensaje: 'Error en la verificación de identidad.' });
  }
};
