import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create doctors
  const doctors = await Promise.all([
    prisma.doctor.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440001' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Anna',
      },
    }),
    prisma.doctor.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440002' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Beni',
      },
    }),
    prisma.doctor.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440003' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Caca',
      },
    }),
    prisma.doctor.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440004' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Dodi',
      },
    }),
    prisma.doctor.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440005' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Elsa',
      },
    }),
  ]);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: '650e8400-e29b-41d4-a716-446655440001' },
      update: {},
      create: {
        id: '650e8400-e29b-41d4-a716-446655440001',
        name: 'Andi',
        email: 'andi@email.com',
      },
    }),
    prisma.customer.upsert({
      where: { id: '650e8400-e29b-41d4-a716-446655440002' },
      update: {},
      create: {
        id: '650e8400-e29b-41d4-a716-446655440002',
        name: 'Bobi',
        email: 'bobi@email.com',
      },
    }),
    prisma.customer.upsert({
      where: { id: '650e8400-e29b-41d4-a716-446655440003' },
      update: {},
      create: {
        id: '650e8400-e29b-41d4-a716-446655440003',
        name: 'Chris',
        email: 'chris@email.com',
      },
    }),
    prisma.customer.upsert({
      where: { id: '650e8400-e29b-41d4-a716-446655440004' },
      update: {},
      create: {
        id: '650e8400-e29b-41d4-a716-446655440004',
        name: 'David',
        email: 'david@email.com',
      },
    }),
    prisma.customer.upsert({
      where: { id: '650e8400-e29b-41d4-a716-446655440005' },
      update: {},
      create: {
        id: '650e8400-e29b-41d4-a716-446655440005',
        name: 'Emma',
        email: 'emma@email.com',
      },
    }),
  ]);

  // Create sample schedules
  const schedules = await Promise.all([
    prisma.schedule.upsert({
      where: { id: '750e8400-e29b-41d4-a716-446655440001' },
      update: {},
      create: {
        id: '750e8400-e29b-41d4-a716-446655440001',
        objective: 'Regular Checkup',
        customerId: '650e8400-e29b-41d4-a716-446655440001',
        doctorId: '550e8400-e29b-41d4-a716-446655440001',
        scheduledAt: new Date('2025-12-15T09:00:00Z'),
      },
    }),
    prisma.schedule.upsert({
      where: { id: '750e8400-e29b-41d4-a716-446655440002' },
      update: {},
      create: {
        id: '750e8400-e29b-41d4-a716-446655440002',
        objective: 'Vaccination',
        customerId: '650e8400-e29b-41d4-a716-446655440002',
        doctorId: '550e8400-e29b-41d4-a716-446655440002',
        scheduledAt: new Date('2025-12-15T10:00:00Z'),
      },
    }),
  ]);

  console.log(`${doctors.length} doctors created`);
  console.log(`${customers.length} customers created`);
  console.log(`${schedules.length} schedules created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
