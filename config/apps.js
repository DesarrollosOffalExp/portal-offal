/**
 * Catálogo de aplicaciones del portal.
 *
 * La clave (key) es la MISMA que se usa en acceso.Permisos.App. El portal cruza
 * los permisos del usuario contra este catálogo para decidir qué tarjetas mostrar
 * y a dónde llevan.
 *
 * ⚠️ CONFIRMAR las URLs de producción con las reales de cada App Service /
 * dominio personalizado antes de publicar. Se pueden sobreescribir por variable
 * de entorno (URL_PROVEEDORES, URL_ETIQUETAS, URL_LAVADOS, URL_KPI, URL_CHOFERES)
 * sin tocar el código.
 */
// Orden en el que se muestran los sectores en el portal.
const ORDEN_SECTORES = ['Gerencia', 'Recursos Humanos', 'Logística', 'Calidad', 'Compras'];

// Sub-áreas dentro del sector "Gerencia". Se muestran TODAS como submenú aunque
// todavía no tengan módulos (es un orden visual; no toca ninguna tabla de SQL).
const SUBGERENCIAS = [
  'Gerencia de Operaciones',
  'Gerencia de Calidad',
  'Gerencia de Mantenimiento',
  'Gerencia de Recursos Humanos',
  'Gerencia de Gestión',
  'Gerencia General',
];

const apps = [
  {
    key: 'kpi',
    sector: 'Gerencia',
    subsector: 'Gerencia de Operaciones',
    nombre: 'Tablero de KPIs',
    descripcion: 'Indicadores de gestión por sector: Insumos, Compras, Fábrica de Hielo, Logística y Sistemas.',
    url: process.env.URL_KPI || 'https://gerencia.offalexpsa.ar',
    acento: 'indigo',
    // Visible y clickeable para todos; la app de KPIs (gerencia.offalexpsa.ar)
    // valida quién ve los datos. Así no depende de un permiso en acceso.Permisos
    // (no se toca la base).
    accesoLibre: true,
  },
  {
    key: 'presupuesto',
    sector: 'Gerencia',
    subsector: 'Gerencia de Gestión',
    nombre: 'Tablero de Presupuesto',
    descripcion: 'Seguimiento y control del presupuesto por área.',
    url: process.env.URL_PRESUPUESTO || '#',
    acento: 'indigo',
    // Todavía no está deployado: se muestra la tarjeta como "Próximamente"
    // (no clickeable) hasta que tenga URL productiva. Cuando se publique,
    // basta setear URL_PRESUPUESTO y quitar esta bandera.
    proximamente: true,
  },
  {
    key: 'contratos',
    sector: 'Compras',
    nombre: 'Contratos Comerciales',
    descripcion: 'Gestión de contratos con proveedores: vencimientos, montos y PDF adjunto.',
    url: process.env.URL_CONTRATOS || 'https://appcompras-cng7b6ewgxdhaqbh.canadacentral-01.azurewebsites.net',
    acento: 'rojo',
  },
  {
    key: 'proveedores',
    sector: 'Recursos Humanos',
    nombre: 'Ingreso de Proveedores',
    descripcion: 'Registro de entradas y salidas de proveedores y visitas en planta.',
    url: process.env.URL_PROVEEDORES || 'https://controlingresoproveedores-e2htbfejf6hkf4bf.eastus-01.azurewebsites.net',
    acento: 'indigo',
  },
  {
    key: 'lavados',
    sector: 'Logística',
    nombre: 'Control de Lavado de Camiones',
    descripcion: 'Lavado de camiones y fábrica de hielo.',
    url: process.env.URL_LAVADOS || 'https://controllavadocamiones-cyhscqdmf7eddhc8.eastus-01.azurewebsites.net',
    acento: 'verde',
  },
  {
    key: 'choferes',
    sector: 'Logística',
    nombre: 'Registro de Choferes',
    descripcion: 'Tiempo de los choferes en planta vs. en viaje (fichada + GPS).',
    url: process.env.URL_CHOFERES || 'https://logistica.offalexpsa.ar',
    acento: 'cyan',
  },
  {
    key: 'etiquetas',
    sector: 'Calidad',
    nombre: 'Control de Etiquetas',
    descripcion: 'Registros de creación y modificación de etiquetas — REG-SIS-007 / 011.',
    url: process.env.URL_ETIQUETAS || 'https://etiquetas.offalexpsa.ar',
    acento: 'cyan',
  },
  {
    key: 'calidad',
    sector: 'Calidad',
    nombre: 'Control de Carga',
    descripcion: 'Control de la mercadería que se carga en congelados para despacho: lectura de codbar y registro del control.',
    url: process.env.URL_CALIDAD || 'https://controlcalidad-c5dvdkb7dae4gnaf.canadacentral-01.azurewebsites.net',
    // ⚠️ TEMPORAL. accesoLibre deja la tarjeta clickeable para todos mientras se
    // prueba el módulo (la app corre con CALIDAD_REQUIRE_PERMISSION=false, así que
    // valida solo estar en acceso.Usuarios). Al cargar los permisos 'calidad' en
    // acceso.Permisos y poner esa variable en true, SACAR esta línea: si no, la
    // tarjeta le sigue apareciendo clickeable a gente que después rebota con
    // "No tenés permiso para este módulo".
    accesoLibre: true,
    acento: 'cyan',
  },
];

module.exports = apps;
module.exports.ORDEN_SECTORES = ORDEN_SECTORES;
module.exports.SUBGERENCIAS = SUBGERENCIAS;
