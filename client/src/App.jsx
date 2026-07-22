import { useEffect, useRef, useState } from 'react';
import { getMe, LOGIN_URL, LOGIN_EXTERNO_URL, INGRESO_EXTERNO_HABILITADO } from './api.js';
import SoporteWidget from './components/SoporteWidget.jsx';

// ¿Mac? Para mostrar ⌘K en vez de Ctrl K en el buscador.
const esMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '');

// Los favoritos se guardan en el navegador de cada persona: no requiere tocar
// el padrón ni sumar endpoints de escritura al portal. Contra: no se comparten
// entre dispositivos.
const FAVORITOS_KEY = 'offal.portal.favoritos';

const leerFavoritos = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(FAVORITOS_KEY) || '[]');
    return new Set(Array.isArray(guardado) ? guardado : []);
  } catch {
    return new Set();
  }
};

// Estrella para marcar/desmarcar un módulo como favorito.
const iconoEstrella = (marcada) => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
    fill={marcada ? 'currentColor' : 'none'} stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const iniciales = (nombre, email) => {
  const base = (nombre || email || '?').trim();
  const partes = base.split(/\s+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
};

// Ícono por sistema (SVG inline, hereda color y tamaño).
const svg = (hijos) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{hijos}</svg>
);
const ICONOS = {
  proveedores: svg(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  lavados: svg(<><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>),
  etiquetas: svg(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>),
  contratos: svg(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>),
};
const iconoDe = (key) => ICONOS[key] || svg(<><circle cx="12" cy="12" r="9" /></>);

export default function App() {
  const [estado, setEstado] = useState('cargando'); // cargando | login | ok | error
  const [data, setData] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sectorActivo, setSectorActivo] = useState(null); // null = todos
  const [busqueda, setBusqueda] = useState('');
  const [favoritos, setFavoritos] = useState(leerFavoritos);
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const buscadorRef = useRef(null);

  const alternarFavorito = (key) => {
    setFavoritos((previos) => {
      const siguiente = new Set(previos);
      if (siguiente.has(key)) siguiente.delete(key);
      else siguiente.add(key);
      try {
        localStorage.setItem(FAVORITOS_KEY, JSON.stringify([...siguiente]));
      } catch {
        // Si el navegador bloquea el almacenamiento, el favorito vale solo para esta visita.
      }
      return siguiente;
    });
  };

  useEffect(() => {
    getMe()
      .then((d) => {
        if (d) {
          setData(d);
          setEstado('ok');
        }
      })
      .catch((e) => setEstado(e?.code === 'NO_AUTH' ? 'login' : 'error'));
  }, []);

  // Ctrl/⌘ + K enfoca el buscador desde cualquier parte.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        buscadorRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (estado === 'cargando') {
    return (
      <main className="wrap">
        <div className="loading">Cargando tu panel…</div>
      </main>
    );
  }

  if (estado === 'login') {
    return (
      <>
        <main className="login-split">
          <div className="login-brand-side">
            <div className="login-brand-inner">
              <span className="login-badge"><img src="/logo.png" alt="Offal Exp S.A." /></span>
              <p className="login-wordmark">OFFAL EXP S.A.</p>
              <p className="login-tag">Portal único de accesos a los sistemas de la empresa.</p>
            </div>
          </div>

          <div className="login-form-side">
            <div className="login-form-inner">
              <p className="login-overline">Panel de accesos</p>
              <h1 className="login-title">Ingresá para continuar</h1>
              <p className="login-lead">
                {INGRESO_EXTERNO_HABILITADO
                  ? 'Usá tu cuenta corporativa. Si no tenés correo de la empresa, entrá con tu correo personal.'
                  : 'Ingresá con tu cuenta corporativa para ver tus sistemas.'}
              </p>

              <a className="btn-ms" href={LOGIN_URL}>
                <svg className="ms-logo" viewBox="0 0 21 21" aria-hidden="true">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                Iniciar sesión con Microsoft
              </a>
              <p className="login-hint">Para cuentas <b>@offal.com.ar</b></p>

              {INGRESO_EXTERNO_HABILITADO && (
                <>
                  <div className="login-sep"><span>o</span></div>

                  <a className="btn-ext" href={LOGIN_EXTERNO_URL}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-10 6L2 7" />
                    </svg>
                    Ingresar con otro correo
                  </a>
                  <p className="login-hint">Personal contratado sin correo corporativo</p>
                </>
              )}
            </div>
          </div>
        </main>
        <SoporteWidget usuario={null} />
      </>
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

  // Sectores que la persona realmente tiene (según sus permisos) y filtro activo.
  const sectoresDisponibles = [...new Set(apps.map((a) => a.sector).filter(Boolean))];
  const q = busqueda.trim().toLowerCase();
  const appsFiltradas = apps
    .filter((a) => {
      const coincideFavorito = !soloFavoritos || favoritos.has(a.key);
      const coincideSector = !sectorActivo || a.sector === sectorActivo;
      const coincideTexto =
        !q ||
        (a.nombre || '').toLowerCase().includes(q) ||
        (a.descripcion || '').toLowerCase().includes(q) ||
        (a.sector || '').toLowerCase().includes(q);
      return coincideFavorito && coincideSector && coincideTexto;
    })
    // Los favoritos van primero, manteniendo el orden del catálogo dentro de cada grupo.
    .sort((a, b) => Number(favoritos.has(b.key)) - Number(favoritos.has(a.key)));

  const cantidadFavoritos = apps.filter((a) => favoritos.has(a.key)).length;

  return (
    <main className="wrap">
      <header className="top">
        <div className="brand">
          <a className="brand-badge" href="/" title="Inicio"><img src="/logo.png" alt="Offal Exp S.A." /></a>
          <span className="brand-mark">OFFAL EXP S.A.</span>
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
        <h1>
          {apps.length > 0
            ? 'Elegí el módulo a utilizar.'
            : 'Todavía no tenés módulos asignados.'}
        </h1>
      </section>

      {apps.length > 0 ? (
        <div className="panel-a">
          <div className="controles">
            <div className="chips">
              <button
                type="button"
                className={`chip ${sectorActivo === null && !soloFavoritos ? 'on' : ''}`}
                onClick={() => { setSectorActivo(null); setSoloFavoritos(false); }}
              >
                Todos
              </button>
              <button
                type="button"
                className={`chip chip-fav ${soloFavoritos ? 'on' : ''}`}
                onClick={() => { setSoloFavoritos(true); setSectorActivo(null); }}
              >
                {iconoEstrella(soloFavoritos)}
                Favoritos
                {cantidadFavoritos > 0 && <span className="chip-cont">{cantidadFavoritos}</span>}
              </button>
              {sectoresDisponibles.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${sectorActivo === s && !soloFavoritos ? 'on' : ''}`}
                  onClick={() => { setSectorActivo(s); setSoloFavoritos(false); }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="search">
              <svg className="lupa" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={buscadorRef}
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar sistema…"
                aria-label="Buscar sistema"
              />
              <span className="kbd" aria-hidden="true">{esMac ? '⌘K' : 'Ctrl K'}</span>
            </div>
          </div>

          {appsFiltradas.length > 0 ? (
            <div className="apps-grid">
              {appsFiltradas.map((a) => {
                const esFavorito = favoritos.has(a.key);
                return (
                  <div className={`app-card ${esFavorito ? 'es-favorito' : ''}`} key={a.key}>
                    <div className="app-acciones">
                      {a.sector && <span className="app-tag">{a.sector}</span>}
                      <button
                        type="button"
                        className={`app-pin ${esFavorito ? 'on' : ''}`}
                        onClick={() => alternarFavorito(a.key)}
                        aria-pressed={esFavorito}
                        aria-label={esFavorito
                          ? `Quitar ${a.nombre} de favoritos`
                          : `Marcar ${a.nombre} como favorito`}
                        title={esFavorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
                      >
                        {iconoEstrella(esFavorito)}
                      </button>
                    </div>
                    <span className="app-icon">{iconoDe(a.key)}</span>
                    {/* El enlace se estira sobre toda la tarjeta (ver .app-enlace::after),
                        así se puede clickear en cualquier parte sin anidar el botón. */}
                    <a className="app-nombre app-enlace" href={a.url}>{a.nombre}</a>
                    <span className="app-desc">{a.descripcion}</span>
                    <span className="app-go">Entrar <span aria-hidden="true">→</span></span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="sin-resultados">
              {soloFavoritos && cantidadFavoritos === 0 && !q ? (
                <>
                  Todavía no marcaste ningún módulo como favorito.<br />
                  Tocá la <span className="estrella-inline">{iconoEstrella(false)}</span> de una tarjeta para tenerlo siempre a mano.
                </>
              ) : (
                <>No encontramos módulos para “{busqueda}”. Probá con otro término o sector.</>
              )}
            </div>
          )}
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
