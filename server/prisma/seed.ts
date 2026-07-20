// ─────────────────────────────────────────────────────────────────────────────
// Prisma Seed — Creates / updates System Admin user
// Run: npm run prisma:seed
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── Admin credentials — change ADMIN_PASSWORD to your desired password ────────
const ADMIN_EMAIL    = 'admin@influencehub.com';
const ADMIN_PASSWORD = 'Admin@InfluenceHub2024';   // ← change this anytime & re-run seed

async function main(): Promise<void> {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });

  if (!existing) {
    const admin = await prisma.user.create({
      data: {
        firstName:    'System',
        lastName:     'Admin',
        email:        ADMIN_EMAIL,
        passwordHash,
        role:         'SYSTEM_ADMIN',
        status:       'ACTIVE',
        emailVerified: true,
      },
    });
    console.log(`✅ System Admin created: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
  } else {
    // Update password and ensure active
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        status:        'ACTIVE',
        emailVerified: true,
        isSuspended:   false,
        lockedUntil:   null,
        failedLoginAttempts: 0,
      },
    });
    console.log(`✅ System Admin updated: ${ADMIN_EMAIL}`);
    console.log(`   ID: ${existing.id}`);
  }

  console.log(`\n📋 Login credentials:`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   Role:     SYSTEM_ADMIN`);
  console.log('\nSeeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
