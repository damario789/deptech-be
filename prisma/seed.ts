import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function truncateTables() {
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;

  // Truncate all tables
  await prisma.$executeRaw`TRUNCATE TABLE \`Leave\`;`;
  await prisma.$executeRaw`TRUNCATE TABLE Employee;`;
  await prisma.$executeRaw`TRUNCATE TABLE Admin;`;

  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;

  console.log('All tables truncated successfully');
}

async function main() {
  // Truncate all tables
  await truncateTables();

  // Seed data Admin
  const password = await bcrypt.hash('admin123', 10);

  await prisma.admin.createMany({
    data: [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@deptech.com',
        birthDate: new Date('1990-01-01'),
        gender: 'MALE',
        password,
      },
      {
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr@deptech.com',
        birthDate: new Date('1988-05-15'),
        gender: 'FEMALE',
        password,
      },
      {
        firstName: 'Finance',
        lastName: 'Director',
        email: 'finance@deptech.com',
        birthDate: new Date('1985-10-20'),
        gender: 'MALE',
        password,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Admin data seeded successfully');

  // Seed data Employee
  await prisma.employee.createMany({
    data: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@deptech.com',
        phone: '08123456789',
        address: 'Jakarta',
        gender: 'MALE',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@deptech.com',
        phone: '08129876543',
        address: 'Bandung',
        gender: 'FEMALE',
      },
      {
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert@deptech.com',
        phone: '08567891234',
        address: 'Surabaya',
        gender: 'MALE',
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria@deptech.com',
        phone: '08765432198',
        address: 'Yogyakarta',
        gender: 'FEMALE',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Employee data seeded successfully');

  const employees = await prisma.employee.findMany();

  if (employees.length > 0) {
    const leaveData = [];

    leaveData.push(
      {
        employeeId: employees[0].id,
        reason: 'Vacation',
        startDate: new Date('2025-09-10'),
        endDate: new Date('2025-09-10'),
        status: 'APPROVED',
      },
      {
        employeeId: employees[0].id,
        reason: 'Family Event',
        startDate: new Date('2025-10-15'),
        endDate: new Date('2025-10-15'),
        status: 'PENDING',
      }
    );

    leaveData.push(
      {
        employeeId: employees[1].id,
        reason: 'Medical Checkup',
        startDate: new Date('2025-09-05'),
        endDate: new Date('2025-09-05'),
        status: 'APPROVED',
      }
    );

    if (employees.length > 2) {
      leaveData.push(
        {
          employeeId: employees[2].id,
          reason: 'Wedding',
          startDate: new Date('2025-11-20'),
          endDate: new Date('2025-11-20'),
          status: 'PENDING',
        },
        {
          employeeId: employees[2].id,
          reason: 'Sick Leave',
          startDate: new Date('2025-08-05'),
          endDate: new Date('2025-08-05'),
          status: 'APPROVED',
        }
      );
    }

    await prisma.leave.createMany({
      data: leaveData,
      skipDuplicates: true,
    });

    console.log('Leave data seeded successfully');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
