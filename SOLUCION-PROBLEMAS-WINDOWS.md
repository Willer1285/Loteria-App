# Solución de Problemas Comunes - Windows

## ✅ Correcciones Aplicadas

Los siguientes problemas ya han sido corregidos en el código:
- ✅ Error de TypeScript con `jwt.sign()`
- ✅ Warning de MODULE_TYPELESS_PACKAGE_JSON en frontend

## 🔧 Problemas Comunes y Soluciones

### 1. Puerto 3000 ocupado

**Síntoma:**
```
Port 3000 is in use, trying another one...
```

**Solución 1: Liberar el puerto**
```bash
# Buscar qué proceso está usando el puerto 3000
netstat -ano | findstr :3000

# Verás algo como:
# TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    1234

# Mata el proceso (reemplaza 1234 con el PID que obtuviste)
taskkill /PID 1234 /F
```

**Solución 2: Usar otro puerto (ya está configurado)**

Si el puerto 3000 está ocupado, Vite automáticamente usará el 3001.
Esto es normal y la app funcionará igual en http://localhost:3001

**Solución 3: Cambiar el puerto del frontend permanentemente**

Edita `frontend/vite.config.ts` y cambia:
```typescript
server: {
  port: 3001,  // Cambiar a 3001 o cualquier otro puerto libre
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```

### 2. Error "ECONNREFUSED" al hacer login

**Síntoma:**
```
[vite] http proxy error: /api/auth/login
AggregateError [ECONNREFUSED]
```

**Causa:** El backend no está corriendo o está en otro puerto.

**Solución:**
1. Verifica que el backend esté corriendo:
   ```bash
   cd backend
   npm run dev
   ```

2. Deberías ver:
   ```
   ✅ MongoDB conectado exitosamente
   🚀 Servidor corriendo en puerto 5000
   ```

3. Si ves errores, verifica que MongoDB esté corriendo.

### 3. MongoDB no conecta

**Síntoma:**
```
❌ Error conectando a MongoDB
```

**Solución para Windows:**

**Opción 1: Iniciar MongoDB como servicio**
```bash
# Abre PowerShell como Administrador
net start MongoDB
```

**Opción 2: Iniciar MongoDB manualmente**
```bash
# Crea la carpeta de datos si no existe
mkdir C:\data\db

# Inicia MongoDB
mongod --dbpath "C:\data\db"
```

**Opción 3: Usar MongoDB Atlas (Cloud - Gratis)**
1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratis
3. Crea un cluster gratuito
4. Obtén tu connection string
5. Edita `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/loteria-app
   ```

### 4. Error de permisos al instalar dependencias

**Solución:**
```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### 5. Error "Cannot find module"

**Solución:**
```bash
# En la raíz del proyecto
npm install

# En backend
cd backend
npm install

# En frontend
cd frontend
npm install
```

### 6. Vite tarda mucho en iniciar (más de 30 segundos)

**Solución:**

Edita `frontend/vite.config.ts` y agrega:
```typescript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
  // ... resto de la configuración
})
```

## 🚀 Comandos Rápidos para Reiniciar

### Reiniciar todo limpiamente:

**PowerShell/CMD:**
```bash
# Detener todos los procesos Node.js
taskkill /F /IM node.exe

# Reiniciar MongoDB
net stop MongoDB
net start MongoDB

# Volver a iniciar la aplicación
npm run dev
```

### Verificar que todo está corriendo:

```bash
# Verificar MongoDB
mongosh
# Si conecta, MongoDB funciona

# Verificar backend
curl http://localhost:5000
# Debería devolver info de la API

# Verificar frontend
# Abre http://localhost:3000 o http://localhost:3001 en tu navegador
```

## 📋 Checklist de Diagnóstico

Antes de reportar un problema, verifica:

- [ ] MongoDB está corriendo (`mongosh` conecta exitosamente)
- [ ] Backend está corriendo (`curl http://localhost:5000`)
- [ ] Frontend está corriendo (abre http://localhost:3000 o 3001)
- [ ] No hay errores en la consola del backend
- [ ] El archivo `backend/.env` existe y está configurado
- [ ] Todas las dependencias están instaladas (`npm install` en cada carpeta)

## 🔍 Ver logs detallados

### Backend:
```bash
cd backend
# Los logs aparecerán automáticamente en la consola
npm run dev
```

### Frontend:
```bash
cd frontend
# Los logs aparecerán en la consola
npm run dev
```

### MongoDB:
```bash
# Ver logs de MongoDB (Windows)
# Los logs suelen estar en:
# C:\Program Files\MongoDB\Server\6.0\log\mongod.log
```

## 💡 Tips Adicionales

### 1. Usar nodemon correctamente
El backend ya tiene nodemon configurado, que reinicia automáticamente cuando cambias archivos.

### 2. Limpiar puertos ocupados masivamente
```bash
# PowerShell - Ver todos los puertos ocupados
Get-NetTCPConnection | Where-Object {$_.LocalPort -eq 3000 -or $_.LocalPort -eq 5000}

# Matar todos los procesos de Node
taskkill /F /IM node.exe
```

### 3. Variables de entorno
Si cambias algo en `backend/.env`, debes reiniciar el backend:
```bash
# Ctrl+C para detener
# Luego reinicia
npm run dev
```

## ⚡ Inicio Rápido después de Reiniciar PC

```bash
# 1. Abrir terminal en la carpeta del proyecto
cd C:\Users\wille\Downloads\Loteria-App\Loteria-App

# 2. Verificar MongoDB (debería iniciarse automáticamente como servicio)
mongosh
# Si no conecta, ejecuta: net start MongoDB

# 3. Iniciar todo
npm run dev

# 4. Abrir navegador en http://localhost:3000 (o 3001 si 3000 está ocupado)
```

## 🆘 Si nada funciona

1. **Reinicia tu PC** - A veces ayuda
2. **Reinstala Node.js** - Descarga la versión LTS desde https://nodejs.org/
3. **Reinstala MongoDB** - Descarga desde https://www.mongodb.com/try/download/community
4. **Clona nuevamente el proyecto** y sigue la guía de INICIO-RAPIDO.md

---

## 📞 Contacto

Si después de seguir esta guía sigues teniendo problemas, documenta:
1. El error exacto que ves
2. Los comandos que ejecutaste
3. Las versiones de Node, npm y MongoDB (`node -v`, `npm -v`, `mongod --version`)
