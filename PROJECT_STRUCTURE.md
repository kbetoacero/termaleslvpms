# 🏨 Termales PMS - Estructura del Proyecto

> Sistema de Gestión Hotelera (PMS) para Hotel de Termales - Next.js 15 + Prisma + PostgreSQL

---

## 📊 Información General

- **Framework:** Next.js 15.5.5 (App Router)
- **Lenguaje:** TypeScript 5
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Autenticación:** NextAuth.js v5
- **UI:** Tailwind CSS 4 + Shadcn/ui
- **Estado:** Zustand + TanStack Query (React Query)
- **Última actualización:** Octubre 2024

---

## 📁 Estructura de Directorios

```
.
├── README.md
├── components.json                 # Configuración de Shadcn/ui
├── eslint.config.mjs              # Configuración ESLint
├── next.config.mjs                # Configuración Next.js
├── package.json                   # Dependencias del proyecto
├── tsconfig.json                  # Configuración TypeScript
│
├── prisma/                        # 🗄️ Base de datos
│   ├── schema.prisma              # Schema de la BD (usuarios, reservas, pagos, etc.)
│   ├── seed.ts                    # Datos iniciales
│   └── migrations/                # Migraciones de BD
│       ├── 20251016210300_init
│       └── 20251017191116_add_recurring_rules
│
├── public/                        # 🖼️ Archivos estáticos
│   ├── Logo-Web-Verde.png
│   └── *.svg                      # Iconos y assets
│
└── src/                           # 📦 Código fuente principal
    ├── app/                       # 🎯 Next.js App Router
    │   ├── (auth)/                # Grupo de rutas: Login/Registro
    │   ├── (dashboard)/           # Grupo de rutas: Dashboard principal
    │   ├── api/                   # API Routes (endpoints backend)
    │   ├── layout.tsx             # Layout raíz
    │   ├── page.tsx               # Página principal
    │   └── globals.css            # Estilos globales
    │
    ├── components/                # 🧩 Componentes React
    │   ├── calendar/              # Calendario de disponibilidad
    │   ├── guests/                # Gestión de huéspedes/clientes
    │   ├── layout/                # Componentes de layout (sidebar, header)
    │   ├── payments/              # 💳 Sistema de pagos
    │   ├── prices/                # Gestión de precios dinámicos
    │   ├── providers/             # Context providers
    │   ├── reservations/          # Sistema de reservas
    │   ├── rooms/                 # Gestión de habitaciones/espacios
    │   ├── shared/                # Componentes compartidos
    │   └── ui/                    # Componentes UI de Shadcn
    │
    ├── lib/                       # 🛠️ Utilidades y configuración
    │   ├── auth.config.ts         # Configuración de autenticación
    │   ├── auth.ts                # Lógica de NextAuth
    │   ├── prisma.ts              # Cliente Prisma singleton
    │   └── utils.ts               # Funciones auxiliares
    │
    └── middleware.ts              # Middleware de Next.js (autenticación)
```

---

## 🏗️ Arquitectura del Proyecto

### **Patrón de diseño:** Feature-based + Domain-driven

El proyecto está organizado por **características/módulos** para facilitar el mantenimiento:

```
Feature (ej: Payments)
├── components/payments/        → UI Components
├── app/api/payments/          → API Endpoints  
└── prisma/schema.prisma       → Data Models (Payment, PaymentMethod, etc.)
```

### **Flujo de datos:**

```
UI Component (React)
    ↓
API Route (/app/api/*)
    ↓
Prisma Client
    ↓
PostgreSQL Database
```

---

## 🛠️ Stack Tecnológico

### **Frontend**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 15.5.5 | Framework React con SSR/SSG |
| React | 19.1.0 | Librería UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 4.x | Estilos utility-first |
| Shadcn/ui | - | Componentes UI accesibles |
| Lucide React | 0.546.0 | Iconos |
| React Hook Form | 7.65.0 | Gestión de formularios |
| Zod | 4.1.12 | Validación de schemas |

### **Estado y Data Fetching**
| Tecnología | Propósito |
|------------|-----------|
| Zustand | 5.0.8 | Estado global ligero |
| TanStack Query | 5.90.5 | Cache y sincronización de datos |
| Date-fns | 4.1.0 | Manipulación de fechas |

### **Backend y Base de Datos**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Prisma ORM | 6.17.1 | ORM para PostgreSQL |
| PostgreSQL | - | Base de datos relacional |
| NextAuth.js | 5.0.0-beta | Autenticación |
| bcryptjs | 3.0.2 | Hash de contraseñas |

### **Herramientas de Desarrollo**
- ESLint 9 - Linting
- Prettier (implícito en Tailwind)
- ts-node / tsx - Ejecución de scripts TypeScript

---

## 📦 Módulos Principales

### 1. **Autenticación** (`/app/(auth)`, `/lib/auth.ts`)
- Login/Logout
- Gestión de sesiones
- Roles y permisos (ADMIN, MANAGER, RECEPTIONIST, STAFF)

### 2. **Dashboard** (`/app/(dashboard)`)
- Panel principal con métricas
- Navegación entre módulos
- Estadísticas en tiempo real

### 3. **Reservas** (`/components/reservations`, `/app/api/reservations`)
- Gestión de reservas (habitaciones, pasadías, camping)
- Calendario de disponibilidad
- Check-in / Check-out
- Estados: PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW

### 4. **Habitaciones** (`/components/rooms`)
- CRUD de tipos de habitación
- Gestión de inventario
- Estados: AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING, BLOCKED
- Categorías: HABITACION, CAMPING, GLAMPING

### 5. **Huéspedes** (`/components/guests`)
- CRM básico
- Historial de reservas
- Datos de contacto y documentos

### 6. **Pagos** (`/components/payments`, `/app/api/payments`) 💳
- Registro de pagos
- Métodos: CASH, CARD, TRANSFER, ONLINE, OTHER
- Estados: PENDING, COMPLETED, FAILED, REFUNDED
- Control de saldo (totalAmount, paidAmount, pendingAmount)

### 7. **Precios Dinámicos** (`/components/prices`)
- Reglas de precios por fechas
- Temporadas alta/baja
- **Recurrencia semanal/mensual** (nuevo feature)
- Multiplicadores de precio

### 8. **Calendario** (`/components/calendar`)
- Vista mensual/semanal
- Disponibilidad en tiempo real
- Gestión de bloqueos

---

## 🗄️ Modelos de Base de Datos (Prisma)

### **Principales entidades:**

```prisma
User           // Usuarios del sistema
Guest          // Clientes/Huéspedes
Reservation    // Reservas principales
Payment        // Pagos realizados
Room           // Habitaciones físicas
RoomType       // Tipos de habitación (plantillas)
Service        // Servicios adicionales
PriceRule      // Reglas de precios dinámicos
ActivityLog    // Auditoría de acciones
```

### **Relaciones clave:**
- `Reservation` ← tiene muchos → `Payment`
- `Reservation` → pertenece a → `Guest`
- `Reservation` ← tiene muchos → `ReservationRoom`
- `Room` → es de tipo → `RoomType`

---

## 🚀 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo (localhost:3000)
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción
npm run lint     # Linter de código

# Prisma
npx prisma migrate dev    # Crear migración
npx prisma db push        # Sincronizar schema sin migración
npx prisma studio         # UI visual de la BD
npx prisma db seed        # Poblar BD con datos iniciales
```

---

## 📍 Navegación Rápida

### **Para trabajar en cada módulo:**

| Módulo | Componentes UI | API Routes | Schema |
|--------|---------------|------------|--------|
| Pagos | `/src/components/payments/` | `/src/app/api/payments/` | `Payment` en schema.prisma |
| Reservas | `/src/components/reservations/` | `/src/app/api/reservations/` | `Reservation` |
| Habitaciones | `/src/components/rooms/` | `/src/app/api/rooms/` | `Room`, `RoomType` |
| Huéspedes | `/src/components/guests/` | `/src/app/api/guests/` | `Guest` |
| Precios | `/src/components/prices/` | `/src/app/api/prices/` | `PriceRule` |

---

## 🔒 Autenticación y Seguridad

- **Middleware:** Protege rutas que requieren autenticación (`/src/middleware.ts`)
- **NextAuth:** Configurado con credenciales y JWT
- **Roles:** Sistema de permisos basado en UserRole
- **Password Hash:** bcryptjs para hash seguro de contraseñas

---

## 📝 Convenciones de Código

### **Naming:**
- Componentes: `PascalCase` (ej: `PaymentForm.tsx`)
- Archivos de utilidades: `camelCase` (ej: `utils.ts`)
- API Routes: `route.ts` (estándar Next.js App Router)
- Hooks personalizados: `use` prefix (ej: `usePayments.ts`)

### **Estructura de componentes:**
```tsx
// 1. Imports
// 2. Types/Interfaces
// 3. Component definition
// 4. Exports
```

### **API Routes:**
```typescript
// GET, POST, PUT, DELETE como named exports
export async function GET(request: Request) { }
export async function POST(request: Request) { }
```

---

## 🎯 Estado del Proyecto

### **✅ Implementado:**
- Autenticación con roles
- CRUD de habitaciones
- Gestión de huéspedes
- Sistema de reservas básico
- Calendario de disponibilidad
- Precios dinámicos con recurrencia
- Dashboard administrativo

### **🚧 En desarrollo:**
- **Sistema de pagos** (módulo actual)
- Reportes y estadísticas avanzadas
- Facturación electrónica
- Notificaciones (email/SMS)

### **📋 Planificado:**
- Integración con canales OTA (Booking, Airbnb)
- Housekeeping (gestión de limpieza)
- POS para restaurante
- App móvil
- Sistema de fidelización

---

## 🐛 Troubleshooting

### **Errores comunes:**

1. **Error de Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Migraciones pendientes:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Variables de entorno:**
   - Crear `.env.local` con `DATABASE_URL` y `NEXTAUTH_SECRET`

---

## 📞 Contacto y Soporte

- **Repository:** https://github.com/kbetoacero/termaleslvpms
- **Developer:** @kbetoacero
- **Framework:** Next.js 15 Documentation - https://nextjs.org/docs

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

_Última actualización: Octubre 2024 | v0.1.0_
