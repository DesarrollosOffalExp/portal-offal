const sql = require('mssql');
require('dotenv').config();

// Conexión a la MISMA base compartida (controletiquetas). El portal solo LEE
// del padrón central (esquema acceso); no crea ni administra tablas.
const dbConfig = {
    user: process.env.DB_USER || process.env.AZURE_SQL_USERNAME,
    password: process.env.DB_PASS || process.env.AZURE_SQL_PASSWORD,
    server: process.env.DB_SERVER || process.env.AZURE_SQL_SERVER,
    database: process.env.DB_NAME || process.env.AZURE_SQL_DATABASE,
    port: parseInt(process.env.DB_PORT || process.env.AZURE_SQL_PORT || '1433'),
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true' || !!process.env.AZURE_SQL_SERVER,
        trustServerCertificate: true,
    },
};

const poolPromise = sql.connect(dbConfig)
    .then((pool) => {
        console.log('✅ Portal conectado a SQL Server (padrón acceso)');
        return pool;
    })
    .catch((err) => {
        console.error('❌ Error de conexión a SQL Server:', err.message);
        return null;
    });

module.exports = { poolPromise, sql };
