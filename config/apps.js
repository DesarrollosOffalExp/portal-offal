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
module.exports = [
  {
    key: 'proveedores',
    nombre: 'Ingreso de Proveedores',
    descripcion: 'Registro de entradas y salidas de proveedores y visitas en planta.',
    url: process.env.URL_PROVEEDORES || 'https://controlingresoproveedores.azurewebsites.net',
    acento: 'indigo',
  },
  {
    key: 'etiquetas',
    nombre: 'Control de Etiquetas',
    descripcion: 'Circuito de solicitudes de etiquetas — REG-SIS-007 / 011.',
    url: process.env.URL_ETIQUETAS || 'https://etiquetas.offalexpsa.ar',
    acento: 'cyan',
  },
  {
    key: 'lavados',
    nombre: 'Control de Lavados',
    descripcion: 'Lavado de camiones y fábrica de hielo.',
    url: process.env.URL_LAVADOS || 'https://controllavadocamiones.azurewebsites.net',
    acento: 'verde',
  },
];
