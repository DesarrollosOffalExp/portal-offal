import { useEffect, useState } from 'react';
import { getMe } from './api.js';

const iniciales = (nombre, email) => {
  const base = (nombre || email || '?').trim();
  const partes = base.split(/\s+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
};

export default function App() {
  const [estado, setEstado] = useState('cargando'); // cargando | ok | error
  const [data, setData] = useState(null);

  useEffect(() => {
    getMe()
      .then((d) => {
        if (d) {
          setData(d);
          setEstado('ok');
        }
      })
      .catch(() => setEstado('error'));
  }, []);

  if (estado === 'cargando') {
    return (
      <main className="wrap">
        <div className="loading">Cargando tu panel…</div>
      </main>
    );
  }

  if (estado === 'error') {
    return (
      <main className="wrap">
        <div className="empty">
          <h2>No pudimos cargar tus accesos</h2>
          <p>Probá recargar la página. Si sigue, avisá a Sistemas.</p>
          <button className="btn" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </main>
    );
  }

  const { usuario, apps } = data;
  const nombreCorto = (usuario.nombre || usuario.email || '').split(/\s+/)[0];

  return (
    <main className="wrap">
      <header className="top">
        <div className="brand">
          <img className="brand-logo" src="/logo.png" alt="Offal" />
          <span className="brand-mark">OFFAL</span>
        </div>
        <a className="user" href="/.auth/logout?post_logout_redirect_uri=/" title="Cerrar sesión">
          <span className="avatar">{iniciales(usuario.nombre, usuario.email)}</span>
          <span className="user-meta">
            <span className="user-name">{usuario.nombre || usuario.email}</span>
            <span className="user-logout">Cerrar sesión</span>
          </span>
        </a>
      </header>

      <section className="hero">
        <p className="overline">Panel de accesos</p>
        <h1>Hola{nombreCorto ? `, ${nombreCorto}` : ''}.</h1>
        <p className="lead">
          {apps.length > 0
            ? 'Elegí a qué sistema querés entrar.'
            : 'Todavía no tenés secciones asignadas.'}
        </p>
      </section>

      {apps.length > 0 ? (
        <ol className="lista">
          {apps.map((a, i) => (
            <li key={a.key}>
              <a className={`item acento-${a.acento}`} href={a.url}>
                <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="item-main">
                  <span className="item-top">
                    <span className="item-nombre">{a.nombre}</span>
                    <span className="rol">{a.rol}</span>
                  </span>
                  <span className="item-desc">{a.descripcion}</span>
                </span>
                <span className="flecha" aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <div className="empty">
          <h2>Sin secciones por ahora</h2>
          <p>
            Tu cuenta está reconocida, pero todavía no tenés permisos cargados.
            Escribile a Sistemas indicando a qué sistema necesitás entrar.
          </p>
        </div>
      )}

      <footer className="pie">
        <span>Offal · Panel de accesos</span>
        <span className="pie-mail">{usuario.email}</span>
      </footer>
    </main>
  );
}
