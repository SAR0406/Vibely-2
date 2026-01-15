require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    const testUsers = [
        {
            email: 'admin@vibely.com',
            password: 'admin0406',
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
            // Update admin password if it exists
            if (userData.email === 'admin@vibely.com') {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                await prisma.user.update({
                    where: { email: userData.email },
                    data: {
                        password: hashedPassword,
                        role: 'ADMIN',
                        isActive: true
                    },
                });
                console.log(`✓ Updated admin user: ${userData.email}`);
            } else {
                console.log(`✓ User ${userData.email} already exists`);
            }
            continue;
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                role: userData.role || 'USER',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
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
