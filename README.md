# Portal Offal — index general

Pantalla de inicio única. La persona entra con su cuenta de Microsoft (Entra ID)
y ve **solo las secciones a las que tiene permiso**, según el padrón central
(esquema `acceso` en la base compartida `controletiquetas`).

- **Stack:** Node (Express) + React (Vite). App Service `offal` (Linux, Node 24).
- **No administra usuarios:** solo lee `acceso.Usuarios` + `acceso.Permisos`.
- **Diseño:** navy + Inter (identidad visual común de Offal).

## Cómo funciona

1. Easy Auth (Entra ID) resuelve el login y reenvía el email en la cabecera
   `x-ms-client-principal-name`.
2. `GET /api/me` busca ese email en `acceso.Usuarios` y sus permisos en
   `acceso.Permisos`, y devuelve las apps del catálogo (`config/apps.js`) para
   las que tiene permiso.
3. El front muestra una tarjeta/fila por cada sección habilitada.

Si la persona está autenticada pero **sin permisos**, entra igual y ve un mensaje
("Sin secciones por ahora") — así se evita el loop de login.

## Desarrollo local

```bash
cp .env.example .env      # completar credenciales de la base compartida
npm install
npm run client:build      # o, en otra terminal: npm run client (Vite en :5175)
npm start                 # backend en :3005
```

En local no hay Easy Auth: el backend simula el usuario `DEV_EMAIL`
(por defecto `roberto.sanabria@offal.com.ar`) para ver el padrón real.

## Checklist para el inge (Azure)

Sobre el App Service **`offal`**:

1. **Variables de entorno** (Configuration → Application settings): las mismas
   credenciales de base que las otras apps —
   `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_ENCRYPT=true`— y
   `NODE_ENV=production`.
2. **Easy Auth** (Authentication → Add identity provider → Microsoft):
   - App registration de Entra (nueva o reutilizada), tenant de OffalExp.
   - "Restrict access: Require authentication".
   - Unauthenticated requests → "HTTP 302 redirect to identity provider".
3. **Secret de deploy** (en el repo de GitHub): descargar el *publish profile*
   del App Service `offal` y cargarlo como secret
   `AZUREAPPSERVICE_PUBLISHPROFILE_OFFAL`.
4. Confirmar las URLs reales de las 3 apps en `config/apps.js` (o setear
   `URL_PROVEEDORES`, `URL_ETIQUETAS`, `URL_LAVADOS`).
