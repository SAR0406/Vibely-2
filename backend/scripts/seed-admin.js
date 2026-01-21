require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedAdmin() {
    console.log('🔐 Creating/updating admin user...');

    const hash = await bcrypt.hash('admin0406', 10);

    await prisma.user.upsert({
        where: { email: 'admin@vibely.com' },
        update: {
            password: hash,
            role: 'ADMIN',
            name: 'Vibely Admin',
            isActive: true
        },
        create: {
            email: 'admin@vibely.com',
            password: hash,
            name: 'Vibely Admin',
            role: 'ADMIN',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VibelyAdmin'
        }
    });

    console.log('✅ Admin user ready: admin@vibely.com / admin0406');
}

seedAdmin()
    .catch(e => console.error('Error:', e))
    .finally(() => prisma.$disconnect());
