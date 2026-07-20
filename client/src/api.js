// Llama a la API del portal. En producción, Easy Auth ya puso la cabecera de
// identidad; en dev, el backend simula el usuario (DEV_EMAIL).
// URL de Easy Auth (Entra ID) para iniciar sesión y volver al inicio.
export const LOGIN_URL = '/.auth/login/aad?post_login_redirect_uri=/';

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
