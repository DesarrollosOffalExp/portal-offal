// Llama a la API del portal. En producción, Easy Auth ya puso la cabecera de
// identidad; en dev, el backend simula el usuario (DEV_EMAIL).
export async function getMe() {
  const res = await fetch('/api/me', { credentials: 'include' });
  if (res.status === 401) {
    // Sin sesión: mandar al login de Azure Easy Auth.
    window.location.href = '/.auth/login/aad?post_login_redirect_uri=/';
    return null;
  }
  if (!res.ok) throw new Error('No se pudieron cargar tus accesos.');
  return res.json();
}
