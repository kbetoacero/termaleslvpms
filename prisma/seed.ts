import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed con datos de prueba...')

  // Limpiar datos existentes (opcional)
  // await prisma.reservation.deleteMany()
  // await prisma.guest.deleteMany()

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@termales.com' },
    update: {},
    create: {
      email: 'admin@termales.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Usuario admin creado')

  // Crear tipos de habitación
  const habitacionEstandar = await prisma.roomType.upsert({
    where: { id: 'habitacion-estandar' },
    update: {},
    create: {
      id: 'habitacion-estandar',
      name: 'Habitación Estándar',
      description: 'Cómoda habitación con vista al jardín',
      category: 'HABITACION',
      capacity: 2,
      basePrice: 150000,
      amenities: ['WiFi', 'TV', 'Baño privado', 'Aire acondicionado'],
      images: [],
    },
  })

  const suiteTermal = await prisma.roomType.upsert({
    where: { id: 'suite-termal' },
    update: {},
    create: {
      id: 'suite-termal',
      name: 'Suite Termal',
      description: 'Suite con jacuzzi privado termal',
      category: 'HABITACION',
      capacity: 2,
      basePrice: 280000,
      amenities: ['WiFi', 'TV', 'Jacuzzi termal privado', 'Terraza'],
      images: [],
    },
  })

  console.log('✅ Tipos de habitación creados')

  // Crear habitaciones
  for (let i = 1; i <= 10; i++) {
    await prisma.room.upsert({
      where: { number: `10${i}` },
      update: {},
      create: {
        roomTypeId: habitacionEstandar.id,
        number: `10${i}`,
        floor: '1',
        status: i <= 6 ? 'OCCUPIED' : 'AVAILABLE',
      },
    })
  }

  for (let i = 1; i <= 5; i++) {
    await prisma.room.upsert({
      where: { number: `20${i}` },
      update: {},
      create: {
        roomTypeId: suiteTermal.id,
        number: `20${i}`,
        floor: '2',
        status: i <= 3 ? 'OCCUPIED' : 'AVAILABLE',
      },
    })
  }

  console.log('✅ Habitaciones creadas')

  // Crear huéspedes de prueba
  const guests = [
    { firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com', phone: '3001234567' },
    { firstName: 'María', lastName: 'García', email: 'maria@example.com', phone: '3007654321' },
    { firstName: 'Carlos', lastName: 'Rodríguez', email: 'carlos@example.com', phone: '3009876543' },
    { firstName: 'Ana', lastName: 'Martínez', email: 'ana@example.com', phone: '3005551234' },
    { firstName: 'Luis', lastName: 'González', email: 'luis@example.com', phone: '3004445566' },
    { firstName: 'Laura', lastName: 'Sánchez', email: 'laura@example.com', phone: '3003332211' },
    { firstName: 'Pedro', lastName: 'López', email: 'pedro@example.com', phone: '3002221100' },
    { firstName: 'Sofia', lastName: 'Ramírez', email: 'sofia@example.com', phone: '3008889999' },
  ]

  const createdGuests = []
  for (const guest of guests) {
    const created = await prisma.guest.upsert({
      where: { email: guest.email },
      update: {},
      create: guest,
    })
    createdGuests.push(created)
  }

  console.log('✅ Huéspedes creados')

  // Crear reservas de prueba
  const today = new Date()
  const rooms = await prisma.room.findMany()

  // Reservas activas (checked-in)
  for (let i = 0; i < 6; i++) {
    const checkIn = new Date(today)
    checkIn.setDate(today.getDate() - Math.floor(Math.random() * 3))
    
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkIn.getDate() + 2 + Math.floor(Math.random() * 3))

    const reservation = await prisma.reservation.create({
      data: {
        reservationNumber: `RES${Date.now()}${i}`,
        type: 'HABITACION',
        status: 'CHECKED_IN',
        checkIn,
        checkOut,
        guestId: createdGuests[i].id,
        adults: 2,
        children: 0,
        totalAmount: 300000,
        paidAmount: 150000,
        pendingAmount: 150000,
        userId: admin.id,
      },
    })

    await prisma.reservationRoom.create({
      data: {
        reservationId: reservation.id,
        roomId: rooms[i].id,
        nightlyRate: 150000,
        nights: 2,
        subtotal: 300000,
      },
    })
  }

  // Check-ins de hoy
  for (let i = 0; i < 2; i++) {
    const checkIn = new Date(today)
    checkIn.setHours(14, 0, 0, 0)
    
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkIn.getDate() + 3)

    await prisma.reservation.create({
      data: {
        reservationNumber: `RES${Date.now()}${i + 10}`,
        type: 'HABITACION',
        status: 'CONFIRMED',
        checkIn,
        checkOut,
        guestId: createdGuests[i + 6].id,
        adults: 2,
        children: 1,
        totalAmount: 450000,
        paidAmount: 0,
        pendingAmount: 450000,
        userId: admin.id,
      },
    })
  }

  // Reservas futuras
  for (let i = 0; i < 3; i++) {
    const checkIn = new Date(today)
    checkIn.setDate(today.getDate() + 1 + i)
    
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkIn.getDate() + 2)

    await prisma.reservation.create({
      data: {
        reservationNumber: `RES${Date.now()}${i + 20}`,
        type: 'HABITACION',
        status: 'CONFIRMED',
        checkIn,
        checkOut,
        guestId: createdGuests[i + 3].id,
        adults: 2,
        children: 0,
        totalAmount: 300000,
        paidAmount: 100000,
        pendingAmount: 200000,
        userId: admin.id,
      },
    })
  }

  console.log('✅ Reservas creadas')

  // Crear servicios
  await prisma.service.createMany({
    data: [
      { name: 'Desayuno', category: 'RESTAURANTE', price: 25000 },
      { name: 'Almuerzo', category: 'RESTAURANTE', price: 35000 },
      { name: 'Cena', category: 'RESTAURANTE', price: 38000 },
      { name: 'Masaje Relajante 30min', category: 'SPA', price: 80000 },
      { name: 'Masaje Relajante 60min', category: 'SPA', price: 150000 },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Servicios creados')

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📝 Credenciales de acceso:')
  console.log('   Email: admin@termales.com')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })