import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding database...');

  const testUsers = [
    {
      email: 'admin@vibely.com',
      password: 'admin123',
      name: 'Vibely Admin',
      role: 'ADMIN',
    },
    {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'USER',
    },
    {
      email: 'john@example.com',
      password: 'password123',
      name: 'John Doe',
      role: 'USER',
    },
    {
      email: 'jane@example.com',
      password: 'password123',
      name: 'Jane Smith',
      role: 'USER',
    },
  ];

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        password: hashedPassword,
        role: userData.role,
        isActive: true, // Ensure admin isn't banned
      },
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          userData.name,
        )}`,
      },
    });

    console.log(`✓ Synchronized user: ${userData.email}`);
  }

  console.log('✅ Database seeding completed');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
