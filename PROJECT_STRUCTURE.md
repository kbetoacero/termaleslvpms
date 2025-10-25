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
- **Última actualización:** Octubre 2024 - v0.2.0

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
│   ├── schema.prisma              # Schema completo (reservas, pagos, housekeeping)
│   ├── seed.ts                    # Datos iniciales
│   └── migrations/                # Migraciones de BD
│       ├── 20251016210300_init
│       ├── 20251017191116_add_recurring_rules
│       └── 20251024_add_housekeeping
│
├── public/                        # 🖼️ Archivos estáticos
│   ├── Logo-Web-Verde.png
│   └── *.svg                      # Iconos y assets
│
└── src/                           # 📦 Código fuente principal
    ├── app/                       # 🎯 Next.js App Router
    │   ├── (auth)/                # Grupo de rutas: Login/Registro
    │   ├── (dashboard)/           # Grupo de rutas: Dashboard principal
    │   │   ├── dashboard/         # Dashboard financiero
    │   │   ├── habitaciones/      # Gestión de habitaciones
    │   │   ├── housekeeping/      # 🧹 Gestión de limpieza (NUEVO)
    │   │   ├── calendario/        # Calendario de disponibilidad
    │   │   ├── reservas/          # Sistema de reservas
    │   │   ├── huespedes/         # CRM de huéspedes
    │   │   ├── pagos/             # Sistema de pagos
    │   │   └── precios/           # Precios dinámicos
    │   ├── api/                   # API Routes (endpoints backend)
    │   │   ├── auth/              # Autenticación
    │   │   ├── reservations/      # CRUD de reservas + checkout
    │   │   ├── payments/          # Sistema de pagos
    │   │   ├── housekeeping/      # 🧹 APIs de limpieza (NUEVO)
    │   │   ├── guests/            # Gestión de huéspedes
    │   │   ├── rooms/             # Gestión de habitaciones
    │   │   ├── prices/            # Reglas de precios
    │   │   ├── notifications/     # 🔔 Sistema de notificaciones (NUEVO)
    │   │   ├── dashboard/         # Métricas del dashboard
    │   │   └── cron/              # Jobs programados
    │   ├── layout.tsx             # Layout raíz
    │   ├── page.tsx               # Página principal
    │   └── globals.css            # Estilos globales
    │
    ├── components/                # 🧩 Componentes React
    │   ├── calendar/              # Calendario de disponibilidad
    │   ├── dashboard/             # 📊 Componentes del dashboard (ACTUALIZADO)
    │   │   ├── Charts.tsx         # Gráficas con Recharts
    │   │   └── DashboardCharts.tsx # Wrapper de gráficas
    │   ├── guests/                # Gestión de huéspedes/clientes
    │   ├── housekeeping/          # 🧹 Componentes de limpieza (NUEVO)
    │   │   ├── RoomCard.tsx       # Tarjeta de habitación con estados
    │   │   └── RoomDetailModal.tsx # Modal de detalles y acciones
    │   ├── layout/                # Componentes de layout
    │   │   ├── Sidebar.tsx        # Menú lateral
    │   │   └── Header.tsx         # Header con notificaciones (ACTUALIZADO)
    │   ├── payments/              # 💳 Sistema de pagos
    │   ├── prices/                # Gestión de precios dinámicos
    │   ├── providers/             # Context providers
    │   │   └── QueryProvider.tsx  # TanStack Query provider (NUEVO)
    │   ├── reservations/          # Sistema de reservas
    │   ├── rooms/                 # Gestión de habitaciones/espacios
    │   ├── shared/                # Componentes compartidos
    │   └── ui/                    # Componentes UI de Shadcn
    │
    ├── hooks/                     # 🎣 Custom Hooks (NUEVO)
    │   ├── useNotifications.ts    # Hook de notificaciones
    │   ├── useDashboardMetrics.ts # Hook de métricas (opcional)
    │   └── useHousekeeping.ts     # Hook de housekeeping
    │
    ├── lib/                       # 🛠️ Utilidades y configuración
    │   ├── auth.config.ts         # Configuración de autenticación
    │   ├── auth.ts                # Lógica de NextAuth
    │   ├── prisma.ts              # Cliente Prisma singleton
    │   ├── utils.ts               # Funciones auxiliares
    │   ├── notifications.ts       # 🔔 Servicio de notificaciones (NUEVO)
    │   └── housekeeping-automation.ts # 🧹 Automatización limpieza (NUEVO)
    │
    └── middleware.ts              # Middleware de Next.js (autenticación)
```

---

## 🏗️ Arquitectura del Proyecto

### **Patrón de diseño:** Feature-based + Domain-driven

El proyecto está organizado por **características/módulos** para facilitar el mantenimiento:

```
Feature (ej: Housekeeping)
├── components/housekeeping/    → UI Components
├── app/api/housekeeping/       → API Endpoints  
├── hooks/useHousekeeping.ts    → Custom Hook
├── lib/housekeeping-automation.ts → Business Logic
└── prisma/schema.prisma        → Data Models
```

### **Flujo de datos:**

```
UI Component (React Client)
    ↓
Custom Hook (TanStack Query)
    ↓
API Route (/app/api/*)
    ↓
Business Logic (/lib/*)
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
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Zustand | 5.0.8 | Estado global ligero |
| TanStack Query | 5.90.5 | Cache y sincronización de datos |
| Date-fns | 4.1.0 | Manipulación de fechas |

### **Gráficas y Visualización**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Recharts | 3.2.1 | Gráficas y charts |

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
- Login/Logout con NextAuth v5
- Gestión de sesiones
- Roles: ADMIN, MANAGER, RECEPTIONIST, STAFF, HOUSEKEEPING
- Middleware de protección de rutas

### 2. **Dashboard Financiero** (`/app/(dashboard)/dashboard`) ✨ MEJORADO
- **KPIs principales:** Ingresos, ocupación, ADR, RevPAR
- **Gráficas interactivas:**
  - Ingresos diarios (área chart)
  - Tendencias de ocupación
  - Métodos de pago (pie chart)
  - Tipos de reservas (bar chart)
- **Top clientes** por gasto total
- **Filtros:** 7, 30 o 90 días
- **Actualización automática** cada 5 minutos

### 3. **Reservas** (`/components/reservations`, `/app/api/reservations`)
- CRUD completo de reservas
- Tipos: HABITACION, PASADIA, CAMPING
- Calendario de disponibilidad
- Check-in / Check-out con integración a Housekeeping
- Estados: PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW
- Generación automática de número de reserva

### 4. **Habitaciones** (`/components/rooms`) ✨ ACTUALIZADO
- CRUD de tipos de habitación
- Gestión de inventario
- **Estados de ocupación:** AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING, BLOCKED
- **Estados de limpieza:** DIRTY, CLEANING, CLEAN, INSPECTED, OUT_OF_ORDER
- **Integración con Housekeeping:** Vista sincronizada de ambos estados
- Categorías: HABITACION, CAMPING, GLAMPING

### 5. **Housekeeping** (`/components/housekeeping`) 🧹 NUEVO
- **Dashboard visual** con tarjetas de habitaciones por piso
- **Estadísticas en tiempo real:** Sucias, en limpieza, limpias, inspeccionadas
- **Gestión de tareas:**
  - Auto-creación en check-out
  - Asignación a personal
  - Tipos: CHECKOUT_CLEANING, DAILY_CLEANING, GUEST_REQUEST, INSPECTION
  - Prioridades: LOW, NORMAL, HIGH, URGENT
- **Cambio rápido de estados** desde modal
- **Checklist personalizable** (preparado para implementar)
- **Integración con Maintenance:** Reportar problemas desde limpieza
- **Logs de historial** de cambios de estado

### 6. **Huéspedes** (`/components/guests`)
- CRM básico
- Historial de reservas
- Datos de contacto y documentos
- Flag VIP

### 7. **Pagos** (`/components/payments`) 💳
- Registro de pagos
- Métodos: CASH, CARD, TRANSFER, ONLINE, OTHER
- Estados: PENDING, COMPLETED, FAILED, REFUNDED
- Control automático de saldo (totalAmount, paidAmount, pendingAmount)
- Validación de pagos excesivos
- Historial por reserva

### 8. **Precios Dinámicos** (`/components/prices`)
- Reglas de precios por fechas
- Temporadas alta/baja
- **Recurrencia:** semanal, mensual, días específicos
- Multiplicadores de precio
- Prioridad de aplicación

### 9. **Notificaciones** (`/components/layout/Header.tsx`) 🔔 NUEVO
- **Sistema de notificaciones en tiempo real**
- Campanita con contador de no leídas
- Tipos de notificaciones:
  - Check-ins/outs del día
  - Pagos recibidos/pendientes
  - Mantenimientos urgentes
  - Nuevas reservas
- **Actualización automática** cada 30 segundos
- Marcar como leída individual o todas
- Navegación directa al contenido relacionado

### 10. **Calendario** (`/components/calendar`)
- Vista mensual/semanal
- Disponibilidad en tiempo real
- Gestión de bloqueos
- Código de colores por ocupación

---

## 🗄️ Modelos de Base de Datos (Prisma)

### **Principales entidades:**

```prisma
// Usuarios y autenticación
User                    // Usuarios del sistema (incluye HOUSEKEEPING)
Guest                   // Clientes/Huéspedes

// Reservas y habitaciones
Reservation             // Reservas principales
ReservationRoom         // Relación reserva-habitación
Room                    // Habitaciones físicas (+ estados de limpieza)
RoomType                // Tipos de habitación (plantillas)

// Pagos y finanzas
Payment                 // Pagos realizados
PriceRule               // Reglas de precios dinámicos

// Servicios
Service                 // Servicios adicionales
ReservationService      // Servicios por reserva

// Housekeeping (NUEVO)
HousekeepingTask        // Tareas de limpieza
ChecklistItem           // Items del checklist
ChecklistTemplate       // Plantillas de checklist
CleaningLog             // Historial de cambios de estado

// Notificaciones (NUEVO)
Notification            // Sistema de notificaciones

// Mantenimiento
Maintenance             // Tickets de mantenimiento
ActivityLog             // Auditoría de acciones
```

### **Enums importantes:**

```prisma
// Estados de habitación
RoomStatus: AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING, BLOCKED

// Estados de limpieza (NUEVO)
CleaningStatus: DIRTY, CLEANING, CLEAN, INSPECTED, OUT_OF_ORDER

// Prioridades de limpieza (NUEVO)
CleaningPriority: LOW, NORMAL, HIGH, URGENT

// Estados de tareas (NUEVO)
TaskStatus: PENDING, IN_PROGRESS, COMPLETED, CANCELLED

// Tipos de tareas (NUEVO)
TaskType: CHECKOUT_CLEANING, DAILY_CLEANING, GUEST_REQUEST, 
          INSPECTION, DEEP_CLEANING, MAINTENANCE

// Tipos de notificaciones (NUEVO)
NotificationType: CHECKIN, CHECKOUT, NEW_RESERVATION, 
                  PAYMENT_PENDING, PAYMENT_RECEIVED, 
                  MAINTENANCE, LOW_INVENTORY, SYSTEM
```

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev      # Servidor de desarrollo (localhost:3000)
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción
npm run lint     # Linter de código

# Prisma
npx prisma migrate dev    # Crear migración
npx prisma db push        # Sincronizar schema sin migración
npx prisma studio         # UI visual de la BD
npx prisma db seed        # Poblar BD con datos iniciales
npx prisma generate       # Regenerar cliente Prisma
```

---

## 📍 Navegación Rápida por Módulo

### **Para trabajar en cada módulo:**

| Módulo | Componentes UI | API Routes | Hooks | Servicios | Schema |
|--------|---------------|------------|-------|-----------|--------|
| **Housekeeping** | `/components/housekeeping/` | `/api/housekeeping/` | `useHousekeeping.ts` | `housekeeping-automation.ts` | `HousekeepingTask`, `CleaningLog` |
| **Notificaciones** | `Header.tsx` | `/api/notifications/` | `useNotifications.ts` | `notifications.ts` | `Notification` |
| **Dashboard** | `/components/dashboard/` | `/api/dashboard/metrics/` | - | - | Agregaciones |
| **Pagos** | `/components/payments/` | `/api/payments/` | - | - | `Payment` |
| **Reservas** | `/components/reservations/` | `/api/reservations/` | - | - | `Reservation` |
| **Habitaciones** | `/components/rooms/` | `/api/rooms/` | - | - | `Room`, `RoomType` |
| **Huéspedes** | `/components/guests/` | `/api/guests/` | - | - | `Guest` |
| **Precios** | `/components/prices/` | `/api/prices/` | - | - | `PriceRule` |

---

## 🔄 Flujos de Trabajo Clave

### **Flujo de Check-out con Housekeeping:**

```
1. Usuario hace click en "Check-out"
   ↓
2. API valida saldo pendiente
   ↓
3. Actualiza reserva a CHECKED_OUT
   ↓
4. 🧹 HOUSEKEEPING:
   - Cambia habitación a status: CLEANING
   - Marca cleaningStatus: DIRTY (prioridad HIGH)
   - Crea HousekeepingTask automática (CHECKOUT_CLEANING)
   - Crea CleaningLog del cambio de estado
   ↓
5. Personal de limpieza ve tarea en Dashboard
   ↓
6. Completa limpieza → Marca como CLEAN
   ↓
7. Supervisor inspecciona → Marca como INSPECTED
   ↓
8. Habitación automáticamente: status → AVAILABLE
```

### **Flujo de Notificaciones:**

```
1. Evento ocurre (nueva reserva, pago, check-out, etc.)
   ↓
2. Servicio llama a createNotification()
   ↓
3. Notificación se guarda en BD
   ↓
4. Hook useNotifications detecta cambio (polling 30s)
   ↓
5. UI actualiza contador en campanita
   ↓
6. Usuario hace click → Ve lista de notificaciones
   ↓
7. Click en notificación → Marca como leída + navega
```

---

## 🔒 Autenticación y Seguridad

- **Middleware:** Protege rutas que requieren autenticación (`/src/middleware.ts`)
- **NextAuth:** Configurado con credenciales y JWT
- **Roles:** Sistema de permisos basado en UserRole
  - `ADMIN`: Acceso total
  - `MANAGER`: Gestión operativa
  - `RECEPTIONIST`: Reservas y check-in/out
  - `STAFF`: Operaciones básicas
  - `HOUSEKEEPING`: Gestión de limpieza
- **Password Hash:** bcryptjs para hash seguro de contraseñas
- **API Protection:** Todos los endpoints verifican sesión

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

### **API Routes (Next.js 15):**
```typescript
// Params debe ser awaited
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ...
}

// Named exports para métodos HTTP
export async function POST(request: Request) { }
export async function PATCH(request: Request) { }
```

---

## 🎯 Estado del Proyecto

### **✅ Completado (v0.2.0):**
- ✅ Autenticación con roles
- ✅ CRUD de habitaciones y tipos
- ✅ Gestión de huéspedes (CRM)
- ✅ Sistema de reservas completo
- ✅ Check-in/Check-out
- ✅ Calendario de disponibilidad
- ✅ Precios dinámicos con recurrencia
- ✅ Sistema de pagos con validaciones
- ✅ **Dashboard financiero con gráficas**
- ✅ **Sistema de notificaciones en tiempo real**
- ✅ **Módulo de Housekeeping completo**
- ✅ **Sincronización habitaciones ↔ limpieza**
- ✅ **Auto-creación de tareas en check-out**

### **🚧 En desarrollo:**
- Reportes y exportación (PDF/Excel)
- Checklist personalizable de limpieza
- Vista de personal de limpieza (simplificada)
- Integración completa con Maintenance
- Calendario con overlay de housekeeping

### **📋 Planificado (Fase 5+):**
- Facturación electrónica
- Integración con canales OTA (Booking, Airbnb)
- POS para restaurante
- Sistema de fidelización
- App móvil para personal
- Notificaciones push/SMS
- API pública para landing page

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

3. **Error de params en Next.js 15:**
   ```typescript
   // ❌ Incorrecto
   const { id } = params
   
   // ✅ Correcto
   const { id } = await params
   ```

4. **Error de foreign key (userId):**
   - Siempre obtener userId de la sesión
   - Nunca usar strings hardcodeados como "system"

5. **Variables de entorno:**
   - Crear `.env.local` con `DATABASE_URL` y `NEXTAUTH_SECRET`

---

## 📞 Contacto y Soporte

- **Repository:** https://github.com/kbetoacero/termaleslvpms
- **Developer:** @kbetoacero
- **Framework:** Next.js 15 Documentation - https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

## 🔄 Changelog

### v0.2.0 (Octubre 2024)
- ✨ Módulo de Housekeeping completo
- ✨ Sistema de notificaciones en tiempo real
- ✨ Dashboard financiero con gráficas
- ✨ Sincronización habitaciones ↔ limpieza
- 🐛 Fix: Params en Next.js 15
- 🐛 Fix: Foreign key constraints en pagos y reservas
- 📝 Actualización de documentación

### v0.1.0 (Octubre 2024)
- 🎉 Lanzamiento inicial
- ✨ Sistema de reservas
- ✨ Gestión de habitaciones
- ✨ Sistema de pagos
- ✨ Precios dinámicos

---

_Última actualización: Octubre 2024 | v0.2.0_