// ─────────────────────────────────────────────────────────────────────────────
// Prisma Seed — Creates / updates test users for all roles
// Run: npm run prisma:seed
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── Seed users ────────────────────────────────────────────────────────────────
const SEED_USERS = [
  {
    firstName: 'System',
    lastName:  'Admin',
    email:     'admin@influencehub.com',
    password:  'Admin@InfluenceHub2024',
    role:      'SYSTEM_ADMIN' as const,
  },
  {
    firstName: 'Silver',
    lastName:  'Influencer',
    email:     'silver@influencehub.com',
    password:  'Silver@Pass2024',
    role:      'SILVER_INFLUENCER' as const,
  },
  {
    firstName: 'Gold',
    lastName:  'Influencer',
    email:     'gold@influencehub.com',
    password:  'Gold@Pass2024',
    role:      'GOLD_INFLUENCER' as const,
  },
  {
    firstName: 'Diamond',
    lastName:  'Influencer',
    email:     'diamond@influencehub.com',
    password:  'Diamond@Pass2024',
    role:      'DIAMOND_INFLUENCER' as const,
  },
  {
    firstName: 'Business',
    lastName:  'Owner',
    email:     'business@influencehub.com',
    password:  'Business@Pass2024',
    role:      'BUSINESS_OWNER' as const,
  },
  {
    firstName: 'Agent',
    lastName:  'User',
    email:     'agent@influencehub.com',
    password:  'Agent@Pass2024',
    role:      'AGENT' as const,
  },
];

async function upsertUser(data: typeof SEED_USERS[number]): Promise<void> {
  const passwordHash = await bcrypt.hash(data.password, 12);
  const existing = await prisma.user.findFirst({ where: { email: data.email } });

  if (!existing) {
    const user = await prisma.user.create({
      data: {
        firstName:          data.firstName,
        lastName:           data.lastName,
        email:              data.email,
        passwordHash,
        role:               data.role,
        status:             'ACTIVE',
        emailVerified:      true,
        isSuspended:        false,
        failedLoginAttempts: 0,
      },
    });
    console.log(`✅  Created  [${data.role.padEnd(20)}]  ${user.email}`);
    console.log(`            ID: ${user.id}`);
  } else {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        status:             'ACTIVE',
        emailVerified:      true,
        isSuspended:        false,
        lockedUntil:        null,
        failedLoginAttempts: 0,
      },
    });
    console.log(`🔄  Updated  [${data.role.padEnd(20)}]  ${data.email}`);
    console.log(`            ID: ${existing.id}`);
  }
}

async function main(): Promise<void> {
  console.log('─────────────────────────────────────────');
  console.log('  InfluenceHub — Database Seed');
  console.log('─────────────────────────────────────────\n');

  for (const user of SEED_USERS) {
    await upsertUser(user);
  }

  console.log('\n─────────────────────────────────────────');
  console.log('  Login Credentials');
  console.log('─────────────────────────────────────────');
  for (const u of SEED_USERS) {
    console.log(`\n  Role:     ${u.role}`);
    console.log(`  Email:    ${u.email}`);
    console.log(`  Password: ${u.password}`);
  }
  console.log('\n─────────────────────────────────────────');
  console.log('  Seeding complete.');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
