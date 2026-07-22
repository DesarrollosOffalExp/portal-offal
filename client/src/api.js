// Llama a la API del portal. En producción, Easy Auth ya puso la cabecera de
// identidad; en dev, el backend simula el usuario (DEV_EMAIL).
// URL de Easy Auth (Entra ID) para iniciar sesión y volver al inicio.
export const LOGIN_URL = '/.auth/login/aad?post_login_redirect_uri=/';

// Ingreso del personal CONTRATADO de Offal que no tiene correo @offal.com.ar
// (nada que ver con los proveedores del módulo de Compras).
//
// Queda APAGADO hasta que se habiliten los invitados (B2B) en Entra: sin eso,
// quien entre por acá llega a Microsoft y no puede pasar. Para prenderlo:
//   1. En Entra: habilitar "Email one-time passcode" e invitar a la persona.
//   2. Cargarla en acceso.Usuarios + acceso.Permisos.
//   3. Poner esta constante en true.
export const INGRESO_EXTERNO_HABILITADO = false;

// Quien entra por acá igual debe estar cargado en acceso.Usuarios para ver algo.
//   - Invitados de Entra (B2B + código por mail): se usa el mismo /aad de arriba.
//   - Proveedor social (Google) en Easy Auth: cambiar a '/.auth/login/google?post_login_redirect_uri=/'.
export const LOGIN_EXTERNO_URL = '/.auth/login/aad?post_login_redirect_uri=/';

export async function getMe() {
  const res = await fetch('/api/me', { credentials: 'include' });
  if (res.status === 401) {
    // Sin sesión: avisamos para mostrar la pantalla de login (en vez de
    // redirigir directo a Microsoft).
    const err = new Error('No autenticado');
    err.code = 'NO_AUTH';
    throw err;
  }
  if (!res.ok) throw new Error('No se pudieron cargar tus accesos.');
  return res.json();
}
