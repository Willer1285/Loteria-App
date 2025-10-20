# Lotería App

Sistema completo de gestión de loterías con panel de administración, gestión de sorteos, pagos, usuarios y rankings.

## Características Principales

### Para Usuarios
- **Registro y autenticación** con JWT
- **Compra de boletos** para sorteos activos
- **Gestión de pagos** (depósitos y retiros)
- **Verificación de boletos** mediante código único
- **Rankings** de jugadores (más boletos comprados, más ganado, etc.)
- **Historial completo** de boletos y transacciones
- **Perfil de usuario** editable

### Para Administradores
- **Panel de administración** completo con estadísticas
- **Gestión de sorteos** (crear, editar, sortear, cancelar)
- **Gestión de usuarios** y permisos
- **Realización automática de sorteos** con asignación de premios
- **Vista de resultados** y ganadores
- **Estadísticas generales** del sistema

## Tecnologías Utilizadas

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Bcrypt** para encriptación de contraseñas
- **Express Validator** para validación de datos

### Frontend
- **React** 18 + **TypeScript**
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **React Hot Toast** para notificaciones
- **Date-fns** para manejo de fechas
- **Recharts** para gráficos

## Estructura del Proyecto

```
Loteria-App/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── lotteryController.ts
│   │   │   ├── ticketController.ts
│   │   │   ├── paymentController.ts
│   │   │   ├── rankingController.ts
│   │   │   └── userController.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Lottery.ts
│   │   │   ├── Ticket.ts
│   │   │   └── Payment.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── lotteryRoutes.ts
│   │   │   ├── ticketRoutes.ts
│   │   │   ├── paymentRoutes.ts
│   │   │   ├── rankingRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── utils/
│   │   │   ├── ticketGenerator.ts
│   │   │   └── lotteryDrawing.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── CreateLotteryModal.tsx
│   │   │   │   └── ManageLotteryModal.tsx
│   │   │   └── Layout.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Lotteries.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── MyTickets.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Rankings.tsx
│   │   │   ├── Register.tsx
│   │   │   └── VerifyTicket.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── package.json
└── README.md
```

## Instalación y Configuración

### Requisitos Previos
- Node.js 18 o superior
- MongoDB 6.0 o superior
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd Loteria-App
```

### 2. Instalar dependencias

```bash
# Instalar dependencias del proyecto raíz
npm install

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la carpeta `backend/`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/loteria-app

# JWT Secret
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=7d

# Cors
CORS_ORIGIN=http://localhost:3000

# Lottery Configuration
MIN_TICKET_PRICE=10
MAX_TICKET_PRICE=1000
COMMISSION_PERCENTAGE=10
```

### 4. Iniciar MongoDB

```bash
# Iniciar el servicio de MongoDB
mongod
```

### 5. Ejecutar la aplicación

#### Opción 1: Ejecutar todo desde la raíz
```bash
npm run dev
```

#### Opción 2: Ejecutar backend y frontend por separado

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

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Uso de la Aplicación

### Crear un Usuario Administrador

Para crear tu primer usuario administrador, registra un usuario normalmente y luego actualiza su rol en MongoDB:

```javascript
// Conectarse a MongoDB
use loteria-app

// Actualizar el rol del usuario a admin
db.users.updateOne(
  { email: "tu-email@ejemplo.com" },
  { $set: { role: "admin" } }
)
```

### Flujo de Trabajo del Administrador

1. **Login** con cuenta de administrador
2. Ir a **Panel de Administración**
3. **Crear nuevo sorteo** con:
   - Nombre y descripción
   - Precio del boleto
   - Cantidad máxima de boletos
   - Fecha del sorteo
   - Configuración de números (rango y cantidad)
4. Los usuarios pueden **comprar boletos**
5. Cuando llegue el momento, **realizar el sorteo**
6. El sistema automáticamente:
   - Genera números ganadores
   - Identifica ganadores
   - Distribuye premios
   - Actualiza balances de usuarios

### Flujo de Trabajo del Usuario

1. **Registrarse** o **Iniciar sesión**
2. **Depositar fondos** en la cuenta
3. Ver **sorteos activos**
4. **Comprar boletos** (con números aleatorios o seleccionados)
5. Ver **mis boletos**
6. **Verificar boletos** con código
7. Ver **rankings** de jugadores
8. **Retirar ganancias** cuando se obtengan premios

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Sorteos
- `GET /api/lotteries` - Obtener todos los sorteos
- `GET /api/lotteries/:id` - Obtener sorteo por ID
- `POST /api/lotteries` - Crear sorteo (admin)
- `PUT /api/lotteries/:id` - Actualizar sorteo (admin)
- `POST /api/lotteries/:id/draw` - Realizar sorteo (admin)
- `POST /api/lotteries/:id/cancel` - Cancelar sorteo (admin)

### Boletos
- `POST /api/tickets/purchase` - Comprar boleto (requiere auth)
- `GET /api/tickets` - Obtener boletos del usuario (requiere auth)
- `GET /api/tickets/verify/:code` - Verificar boleto (requiere auth)
- `GET /api/tickets/number/:number` - Buscar por número (requiere auth)

### Pagos
- `POST /api/payments/deposit` - Realizar depósito (requiere auth)
- `POST /api/payments/withdraw` - Realizar retiro (requiere auth)
- `GET /api/payments/history` - Historial de pagos (requiere auth)
- `GET /api/payments/all` - Todos los pagos (admin)

### Rankings
- `GET /api/rankings/top-buyers` - Top compradores de boletos
- `GET /api/rankings/top-winners` - Top ganadores
- `GET /api/rankings/top-spenders` - Top gastadores
- `GET /api/rankings/stats` - Estadísticas generales

### Usuarios
- `GET /api/users` - Obtener todos los usuarios (admin)
- `GET /api/users/:id` - Obtener usuario por ID (admin)
- `PUT /api/users/:id` - Actualizar usuario
- `POST /api/users/:id/deactivate` - Desactivar usuario (admin)
- `POST /api/users/:id/activate` - Activar usuario (admin)
- `GET /api/users/:id/stats` - Estadísticas del usuario

## Modelos de Datos

### User
```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  balance: number;
  isActive: boolean;
  phone?: string;
  address?: string;
  totalSpent: number;
  totalWon: number;
  ticketsPurchased: number;
}
```

### Lottery
```typescript
{
  name: string;
  description: string;
  ticketPrice: number;
  totalPrize: number;
  drawDate: Date;
  status: 'upcoming' | 'active' | 'drawing' | 'completed' | 'cancelled';
  maxTickets: number;
  soldTickets: number;
  winningNumbers?: number[];
  winners?: Array<{
    userId: ObjectId;
    ticketId: ObjectId;
    prize: number;
    position: number;
  }>;
  prizeDistribution: Array<{
    position: number;
    percentage: number;
    amount: number;
  }>;
  numbersRange: {
    min: number;
    max: number;
    count: number;
  };
}
```

### Ticket
```typescript
{
  ticketNumber: string;
  lotteryId: ObjectId;
  userId: ObjectId;
  numbers: number[];
  purchaseDate: Date;
  price: number;
  status: 'active' | 'won' | 'lost' | 'refunded';
  isVerified: boolean;
  verificationCode: string;
  matchedNumbers?: number;
  prize?: number;
}
```

### Payment
```typescript
{
  userId: ObjectId;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'ticket_purchase' | 'prize_payout' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'wallet' | 'cash';
  transactionId?: string;
  ticketId?: ObjectId;
  lotteryId?: ObjectId;
  description: string;
}
```

## Características de Seguridad

- **Autenticación JWT** con tokens seguros
- **Contraseñas encriptadas** con bcrypt
- **Validación de datos** en todas las entradas
- **Autorización por roles** (admin/user)
- **Protección CORS** configurada
- **Códigos de verificación únicos** para boletos

## Scripts Disponibles

### Raíz del proyecto
- `npm run dev` - Ejecuta backend y frontend simultáneamente
- `npm run build` - Construye backend y frontend para producción

### Backend
- `npm run dev` - Ejecuta servidor en modo desarrollo
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Ejecuta servidor en producción

### Frontend
- `npm run dev` - Ejecuta aplicación en modo desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Vista previa de la build de producción

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Soporte

Para preguntas, problemas o sugerencias, por favor abre un issue en el repositorio.

---

Desarrollado con ❤️ para la comunidad de lotería
