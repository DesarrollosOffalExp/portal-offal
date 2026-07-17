import { useEffect, useState } from 'react';
import { getMe } from './api.js';
import SoporteWidget from './components/SoporteWidget.jsx';

const iniciales = (nombre, email) => {
  const base = (nombre || email || '?').trim();
  const partes = base.split(/\s+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
};

// Rol legible (en vez del código en crudo).
const ROL_LABEL = {
  ADMIN: 'Administrador', OPERADOR: 'Operador', OPERARIO: 'Operario',
  ADMINISTRATIVO: 'Administrativo', CALIDAD: 'Calidad', SISTEMAS: 'Sistemas',
};
const rolLabel = (r) => ROL_LABEL[String(r || '').toUpperCase()] || r;

// Ícono por sistema (SVG inline, hereda color y tamaño).
const svg = (hijos) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{hijos}</svg>
);
const ICONOS = {
  proveedores: svg(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  lavados: svg(<><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>),
  etiquetas: svg(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>),
};
const iconoDe = (key) => ICONOS[key] || svg(<><circle cx="12" cy="12" r="9" /></>);

// Agrupa las apps por sector, respetando el orden en que vienen del catálogo.
const agruparPorSector = (apps) => {
  const grupos = [];
  const idx = new Map();
  for (const a of apps) {
    const sec = a.sector || 'Otros';
    if (!idx.has(sec)) { idx.set(sec, grupos.length); grupos.push({ sector: sec, apps: [] }); }
    grupos[idx.get(sec)].apps.push(a);
  }
  return grupos;
};

export default function App() {
  const [estado, setEstado] = useState('cargando'); // cargando | ok | error
  const [data, setData] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sectorActivo, setSectorActivo] = useState(null); // null = todos

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

  // Sectores que la persona realmente tiene (según sus permisos) y filtro activo.
  const sectoresDisponibles = [...new Set(apps.map((a) => a.sector).filter(Boolean))];
  const appsFiltradas = sectorActivo ? apps.filter((a) => a.sector === sectorActivo) : apps;

  return (
    <main className="wrap">
      <header className="top">
        <div className="brand">
          <a className="brand-badge" href="/" title="Inicio"><img src="/logo.png" alt="Offal" /></a>
          <span className="brand-mark">OFFAL</span>
        </div>
        <div className="user-wrap">
          <button
            type="button"
            className="user"
            aria-haspopup="true"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <span className="avatar">{iniciales(usuario.nombre, usuario.email)}</span>
            <span className="user-meta">
              <span className="user-name">{usuario.nombre || usuario.email}</span>
              <span className="user-logout">Mi cuenta</span>
            </span>
            <span className="user-caret" aria-hidden="true">▾</span>
          </button>
          {menuAbierto && (
            <>
              <div className="menu-backdrop" onClick={() => setMenuAbierto(false)} />
              <div className="user-menu" role="menu">
                <div className="user-menu-head">
                  <span className="user-menu-name">{usuario.nombre || usuario.email}</span>
                  <span className="user-menu-mail">{usuario.email}</span>
                </div>
                <a className="user-menu-item" href="/.auth/logout?post_logout_redirect_uri=/" role="menuitem">
                  Cerrar sesión
                </a>
              </div>
            </>
          )}
        </div>
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
        <div className="panel">
          <aside className="sidebar">
            <p className="sidebar-label">Sectores</p>
            <button
              type="button"
              className={`sector-link ${sectorActivo === null ? 'on' : ''}`}
              onClick={() => setSectorActivo(null)}
            >
              Todos
            </button>
            {sectoresDisponibles.map((s) => (
              <button
                key={s}
                type="button"
                className={`sector-link ${sectorActivo === s ? 'on' : ''}`}
                onClick={() => setSectorActivo(s)}
              >
                {s}
              </button>
            ))}
          </aside>

          <div className="panel-main">
            {agruparPorSector(appsFiltradas).map((grupo) => (
              <section className="sector" key={grupo.sector}>
                <h2 className="sector-titulo">{grupo.sector}</h2>
                <div className="apps">
                  {grupo.apps.map((a) => (
                    <a className="app-card" key={a.key} href={a.url}>
                      <span className="app-icon">{iconoDe(a.key)}</span>
                      <span className="app-body">
                        <span className="app-top">
                          <span className="app-nombre">{a.nombre}</span>
                          <span className="rol">{rolLabel(a.rol)}</span>
                        </span>
                        <span className="app-desc">{a.descripcion}</span>
                      </span>
                      <span className="flecha" aria-hidden="true">→</span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
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

      <SoporteWidget usuario={usuario} />
    </main>
  );
}
