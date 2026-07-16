/**
 * Catálogo de aplicaciones del portal.
 *
 * La clave (key) es la MISMA que se usa en acceso.Permisos.App. El portal cruza
 * los permisos del usuario contra este catálogo para decidir qué tarjetas mostrar
 * y a dónde llevan.
 *
 * ⚠️ CONFIRMAR las URLs de producción con las reales de cada App Service /
 * dominio personalizado antes de publicar. Se pueden sobreescribir por variable
 * de entorno (URL_PROVEEDORES, URL_ETIQUETAS, URL_LAVADOS) sin tocar el código.
 */
// Orden en el que se muestran los sectores en el portal.
const ORDEN_SECTORES = ['Recursos Humanos', 'Logística', 'Calidad'];

const apps = [
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
    key: 'etiquetas',
    sector: 'Calidad',
    nombre: 'Control de Etiquetas',
    descripcion: 'Registros de creación y modificación de etiquetas — REG-SIS-007 / 011.',
    url: process.env.URL_ETIQUETAS || 'https://etiquetas.offalexpsa.ar',
    acento: 'cyan',
  },
];

module.exports = apps;
module.exports.ORDEN_SECTORES = ORDEN_SECTORES;
