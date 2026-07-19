// ─────────────────────────────────────────────────────────────────────────────
// Prisma Seed — Creates initial System Admin user
// Run: npm run prisma:seed
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding database...');

  // Create System Admin
  const adminEmail = 'admin@influencehub.com';
  const existing = await prisma.user.findFirst({ where: { email: adminEmail } });

  if (!existing) {
    const passwordHash = await bcrypt.hash('Admin@SecurePass1', 12);

    const admin = await prisma.user.create({
      data: {
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        passwordHash,
        role: 'SYSTEM_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    console.log(`System Admin created: ${admin.email} (id: ${admin.id})`);
  } else {
    console.log(`System Admin already exists: ${adminEmail}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
