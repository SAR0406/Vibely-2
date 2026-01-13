require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const dbPath = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    const testUsers = [
        {
            email: 'admin@vibely.com',
            password: 'adminpassword123',
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
        },
        {
            email: 'jane@example.com',
            password: 'password123',
            name: 'Jane Smith',
        },
    ];

    console.log('👥 Creating test users...');
    for (const userData of testUsers) {
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            console.log(`✓ User ${userData.email} already exists`);
            continue;
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                role: userData.role || 'USER',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
            },
        });

        console.log(`✓ Created user: ${userData.email}`);
    }

    console.log('✅ Database seeding completed!');
    console.log('\n📝 Test credentials:');
    testUsers.forEach(user => {
        console.log(`   Email: ${user.email}, Password: ${user.password}`);
    });
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
