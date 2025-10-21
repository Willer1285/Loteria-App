# Configuración para Producción

Guía paso a paso para configurar MongoDB Atlas y el servicio de email para la aplicación de lotería.

## 📋 Tabla de Contenidos
1. [Configurar MongoDB Atlas](#configurar-mongodb-atlas)
2. [Configurar Email con Gmail](#configurar-email-con-gmail)
3. [Configurar Email con SendGrid](#configurar-email-con-sendgrid)
4. [Variables de Entorno](#variables-de-entorno)
5. [Verificar Configuración](#verificar-configuración)

---

## 🗄️ Configurar MongoDB Atlas

MongoDB Atlas es la base de datos en la nube de MongoDB. Es gratis para empezar (hasta 512MB).

### Paso 1: Crear Cuenta y Cluster

1. **Ir a MongoDB Atlas**
   - Visita: https://cloud.mongodb.com
   - Click en "Try Free" o "Sign In"
   - Crea una cuenta (puedes usar Google/GitHub)

2. **Crear un Cluster Gratuito**
   - Click en "Build a Database"
   - Selecciona **"M0 FREE"** (Shared)
   - Elige el proveedor (AWS, Google Cloud, o Azure)
   - Selecciona la región más cercana a ti
   - Click en "Create"
   - Espera 1-3 minutos mientras se crea

### Paso 2: Crear Usuario de Base de Datos

1. **En la sección "Security"**
   - Click en "Database Access" (menú izquierdo)
   - Click en "Add New Database User"

2. **Configurar el Usuario**
   - Authentication Method: **Password**
   - Username: `loteria-admin` (o el que prefieras)
   - Password: Click en "Autogenerate Secure Password" o crea una
   - **⚠️ IMPORTANTE:** Copia y guarda la contraseña (la necesitarás)

3. **Permisos**
   - Database User Privileges: **"Read and write to any database"**
   - Click en "Add User"

### Paso 3: Configurar Acceso de Red

1. **En la sección "Security"**
   - Click en "Network Access" (menú izquierdo)
   - Click en "Add IP Address"

2. **Opciones:**

   **Opción A: Permitir TODO (Desarrollo)**
   - Click en "Allow Access from Anywhere"
   - IP Address: `0.0.0.0/0`
   - ⚠️ Solo para desarrollo/testing

   **Opción B: IP Específica (Recomendado)**
   - Click en "Add Current IP Address"
   - O ingresa manualmente tu IP pública

   - Click en "Confirm"

### Paso 4: Obtener la URI de Conexión

1. **Volver a "Database"**
   - Click en "Database" en el menú izquierdo
   - Click en el botón **"Connect"** de tu cluster

2. **Seleccionar Método**
   - Click en "Connect your application"

3. **Copiar la Connection String**
   - Driver: **Node.js**
   - Version: Selecciona la más reciente
   - Verás algo como:
     ```
     mongodb+srv://loteria-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

4. **Modificar la URI**
   - Reemplaza `<password>` con tu contraseña
   - Agrega el nombre de la base de datos: `/loteria-app` antes del `?`
   - Resultado final:
     ```
     mongodb+srv://loteria-admin:TuContraseña123@cluster0.xxxxx.mongodb.net/loteria-app?retryWrites=true&w=majority
     ```

### Paso 5: Configurar en tu Aplicación

1. **Edita el archivo `backend/.env`**
   ```env
   MONGODB_URI=mongodb+srv://loteria-admin:TuContraseña123@cluster0.xxxxx.mongodb.net/loteria-app?retryWrites=true&w=majority
   ```

2. **⚠️ IMPORTANTE:**
   - NO incluyas espacios
   - NO uses caracteres especiales en la contraseña sin codificar
   - Si tu contraseña tiene caracteres especiales, codifícala:
     - `@` → `%40`
     - `#` → `%23`
     - `$` → `%24`
     - etc.

---

## 📧 Configurar Email con Gmail

Gmail es gratis y fácil de configurar para desarrollo y uso moderado.

### Requisitos Previos
- Cuenta de Gmail
- Verificación en 2 pasos activada

### Paso 1: Activar Verificación en 2 Pasos

1. **Ir a la configuración de seguridad**
   - Visita: https://myaccount.google.com/security
   - Busca "Verificación en 2 pasos"
   - Click en "Comenzar"
   - Sigue los pasos para activarla

### Paso 2: Crear Contraseña de Aplicación

1. **Ir a Contraseñas de Aplicación**
   - Visita: https://myaccount.google.com/apppasswords
   - (O desde Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones)

2. **Generar Nueva Contraseña**
   - App: Selecciona "Correo"
   - Dispositivo: Selecciona "Otro (nombre personalizado)"
   - Nombre: "Loteria App" o el que prefieras
   - Click en "Generar"

3. **Copiar la Contraseña**
   - Gmail mostrará una contraseña de 16 caracteres
   - Ejemplo: `abcd efgh ijkl mnop`
   - **⚠️ Copia esta contraseña** (no la podrás ver de nuevo)

### Paso 3: Configurar en tu Aplicación

Edita el archivo `backend/.env`:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=Lotería App
```

**⚠️ IMPORTANTE:**
- Usa la contraseña de 16 caracteres SIN ESPACIOS
- Ejemplo: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

---

## 📨 Configurar Email con SendGrid

SendGrid es ideal para producción (hasta 100 emails/día gratis).

### Paso 1: Crear Cuenta

1. **Registrarse en SendGrid**
   - Visita: https://signup.sendgrid.com
   - Completa el registro
   - Verifica tu email

2. **Completar el Onboarding**
   - SendGrid te pedirá información sobre tu uso
   - Completa el formulario

### Paso 2: Verificar Sender Identity

1. **Single Sender Verification**
   - Ve a Settings → Sender Authentication
   - Click en "Verify a Single Sender"
   - Completa el formulario con tu email
   - Verifica el email que te envían

### Paso 3: Crear API Key

1. **Ir a API Keys**
   - Settings → API Keys
   - Click en "Create API Key"

2. **Configurar el API Key**
   - Name: "Loteria App"
   - API Key Permissions: **"Full Access"** (o "Mail Send" si prefieres limitar)
   - Click en "Create & View"

3. **Copiar el API Key**
   - SendGrid mostrará el key UNA SOLA VEZ
   - Ejemplo: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **⚠️ CÓPIALO AHORA** (no podrás verlo de nuevo)

### Paso 4: Configurar en tu Aplicación

Edita el archivo `backend/.env`:

```env
# Email Configuration
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_NAME=Lotería App
```

---

## 🔧 Variables de Entorno

Archivo completo `backend/.env` con todas las configuraciones:

```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/loteria-app?retryWrites=true&w=majority

# JWT
JWT_SECRET=clave-super-secreta-de-al-menos-32-caracteres-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://tu-dominio.com

# Frontend URL
FRONTEND_URL=https://tu-dominio.com

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=Lotería App

# O Email (SendGrid)
# EMAIL_SERVICE=sendgrid
# EMAIL_USER=apikey
# EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxx
# EMAIL_FROM_NAME=Lotería App

# Lottery
MIN_TICKET_PRICE=10
MAX_TICKET_PRICE=1000
COMMISSION_PERCENTAGE=10
```

---

## ✅ Verificar Configuración

### 1. Verificar MongoDB Atlas

```bash
cd backend
npm run dev
```

Deberías ver:
```
✅ MongoDB conectado exitosamente
📦 Base de datos: loteria-app
🌍 Tipo: MongoDB Atlas (Cloud)
🚀 Servidor corriendo en puerto 5000
```

Si ves errores:
- **"authentication failed"**: Usuario/contraseña incorrectos
- **"Could not connect"**: Verifica IP whitelist en Atlas
- **Timeout**: Verifica la URI de conexión

### 2. Verificar Email

**Modo Desarrollo (Sin configuración):**
```
⚠️  Email no configurado - Modo desarrollo
📧 ===== EMAIL (Modo Desarrollo) =====
```

**Con Configuración Correcta:**
```
✅ Email service configured: gmail
✅ Email enviado: <message-id>
```

### 3. Probar Recuperación de Contraseña

1. Ir a http://localhost:3000/forgot-password
2. Ingresar un email registrado
3. **Sin email configurado:** Ver token en consola
4. **Con email configurado:** Recibir email con enlace

---

## 🚨 Problemas Comunes

### MongoDB Atlas

**Error: IP not whitelisted**
- Solución: Agrega tu IP en Network Access
- O usa `0.0.0.0/0` para permitir todas

**Error: Authentication failed**
- Verifica usuario y contraseña
- Recuerda codificar caracteres especiales en la contraseña

**Error: Timeout**
- Verifica que la URI sea correcta
- Verifica tu conexión a internet

### Email

**Gmail: "Invalid login"**
- Verifica que Verificación en 2 pasos esté activa
- Usa la contraseña de aplicación, NO tu contraseña de Gmail
- Quita los espacios de la contraseña de 16 caracteres

**SendGrid: API Key inválido**
- Verifica que copiaste el key completo
- Verifica que starts con `SG.`
- Crea un nuevo key si perdiste el original

**Emails no llegan**
- Revisa spam/correo no deseado
- Verifica que el Sender esté verificado en SendGrid
- Revisa los logs del backend para errores

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs** de la consola del backend
2. **Verifica las variables** en `.env`
3. **Prueba la conexión** por separado
4. **Consulta la documentación** oficial:
   - MongoDB Atlas: https://docs.atlas.mongodb.com
   - Gmail: https://support.google.com/accounts/answer/185833
   - SendGrid: https://docs.sendgrid.com

---

¡Listo! Tu aplicación ahora está configurada para producción. 🎉
