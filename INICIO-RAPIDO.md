# Guía Rápida de Inicio - Lotería App

## ✅ Estado Actual
- ✅ Dependencias instaladas (root, backend, frontend)
- ✅ Variables de entorno configuradas
- ⚠️ Requiere: MongoDB instalado y ejecutándose

## 🚀 Iniciar la Aplicación

### Opción 1: Iniciar todo desde la raíz (Recomendado)
```bash
npm run dev
```
Esto iniciará el backend (puerto 5000) y frontend (puerto 3000) simultáneamente.

### Opción 2: Iniciar backend y frontend por separado

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📋 Requisitos Previos

### 1. Instalar MongoDB

**Windows:**
1. Descarga MongoDB Community Server desde: https://www.mongodb.com/try/download/community
2. Instala MongoDB
3. Inicia el servicio:
   ```bash
   # Opción 1: Como servicio de Windows (automático)
   # MongoDB se instalará como servicio y se iniciará automáticamente

   # Opción 2: Manual
   mongod --dbpath "C:\data\db"
   ```

**Verificar que MongoDB está corriendo:**
```bash
# Abre otra terminal y ejecuta:
mongosh
# Si se conecta, MongoDB está funcionando correctamente
```

### 2. Verificar configuración

El archivo `backend/.env` ya está configurado con:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/loteria-app
JWT_SECRET=<generado automáticamente>
CORS_ORIGIN=http://localhost:3000
```

## 🎯 Primer Uso

### 1. Asegúrate de que MongoDB está corriendo
```bash
mongosh
# Deberías ver la conexión exitosa
```

### 2. Inicia la aplicación
```bash
npm run dev
```

### 3. Accede a la aplicación
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 4. Crea tu primer usuario
1. Ve a http://localhost:3000
2. Click en "Regístrate"
3. Completa el formulario de registro
4. Inicia sesión con tu nuevo usuario

### 5. Convertir usuario en administrador

Para tener acceso al panel de administración:

**Opción 1: Desde MongoDB Compass (GUI)**
1. Descarga MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Conecta a: `mongodb://localhost:27017`
3. Selecciona la base de datos `loteria-app`
4. Selecciona la colección `users`
5. Encuentra tu usuario por email
6. Edita el documento y cambia `role: "user"` a `role: "admin"`
7. Guarda los cambios

**Opción 2: Desde mongosh (Terminal)**
```bash
# Abre mongosh
mongosh

# Conecta a la base de datos
use loteria-app

# Actualiza el rol del usuario (reemplaza con tu email)
db.users.updateOne(
  { email: "tu-email@ejemplo.com" },
  { $set: { role: "admin" } }
)

# Verifica el cambio
db.users.findOne({ email: "tu-email@ejemplo.com" })
```

### 6. Recarga la aplicación
1. Cierra sesión
2. Inicia sesión nuevamente
3. Ahora verás la opción "Admin" en el menú lateral

## 🎮 Flujo de Uso

### Como Administrador:
1. Ve a **Admin** → Panel de Administración
2. Click en **Crear Sorteo**
3. Configura:
   - Nombre: "Sorteo Semanal"
   - Descripción: "Gran sorteo de la semana"
   - Precio por boleto: 10
   - Máximo de boletos: 100
   - Fecha del sorteo: (selecciona una fecha futura)
   - Números: min 1, max 50, cantidad 6
4. Click en **Crear Sorteo**

### Como Usuario:
1. Ve a **Pagos**
2. Click en **Depositar**
3. Ingresa un monto (ej: 100)
4. Ve a **Sorteos**
5. Click en **Comprar Boleto** en un sorteo activo
6. Selecciona la cantidad de boletos
7. Confirma la compra
8. Ve a **Mis Boletos** para ver tus boletos

### Realizar un Sorteo:
1. Como admin, ve al **Panel de Administración**
2. En el sorteo activo, click en **Sortear**
3. Confirma la acción
4. El sistema automáticamente:
   - Genera números ganadores
   - Identifica ganadores
   - Distribuye premios a los ganadores
   - Actualiza los balances

## 🔧 Solución de Problemas

### MongoDB no se conecta
```bash
# Windows - Inicia el servicio
net start MongoDB

# O inicia manualmente
mongod --dbpath "C:\data\db"
```

### Puerto 3000 o 5000 ya en uso
```bash
# Windows - Encuentra el proceso
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Mata el proceso (reemplaza PID)
taskkill /PID <PID> /F
```

### Error al instalar dependencias
```bash
# Limpia y reinstala
rm -rf node_modules package-lock.json
cd backend
rm -rf node_modules package-lock.json
cd ../frontend
rm -rf node_modules package-lock.json
cd ..

# Reinstala todo
npm install
cd backend && npm install
cd ../frontend && npm install
```

## 📱 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000 (muestra info de la API)

## 🎯 Siguiente Paso

**¡Todo listo!** Ejecuta:
```bash
npm run dev
```

Y accede a http://localhost:3000 para empezar a usar la aplicación.

## ⚠️ Notas Importantes

1. **MongoDB debe estar corriendo** antes de iniciar la aplicación
2. Los **warnings de npm** son normales y no afectan la funcionalidad
3. La primera vez que ejecutes el backend, se creará automáticamente la base de datos
4. Los **premios se pagan automáticamente** cuando se realiza un sorteo
5. El **balance del usuario** se actualiza en tiempo real

## 📞 Ayuda

Si tienes problemas:
1. Verifica que MongoDB está corriendo
2. Verifica que los puertos 3000 y 5000 están libres
3. Revisa los logs en la consola del backend
4. Revisa el archivo backend/.env

---

¡Disfruta tu aplicación de lotería! 🎰🎉
