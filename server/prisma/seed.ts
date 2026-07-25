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
    firstName: 'Super',
    lastName:  'Admin',
    email:     'superadmin@influencehub.com',
    password:  'SuperAdmin@InfluenceHub2024',
    role:      'SUPER_ADMIN' as const,
  },
  {
    firstName: 'Admin',
    lastName:  'User',
    email:     'admin@influencehub.com',
    password:  'Admin@InfluenceHub2024',
    role:      'ADMIN' as const,
  },
  {
    firstName: 'Influencer',
    lastName:  'Hub',
    email:     'silver@influencehub.com',
    password:  'Silver@Pass2024',
    role:      'INFLUENCER' as const,
    tier:      'SILVER' as const,
  },

  {
    firstName: 'Business',
    lastName:  'User',
    email:     'business@influencehub.com',
    password:  'Business@Pass2024',
    role:      'BUSINESS' as const,
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

    // Create influencer profile for INFLUENCER role users with tier
    if (data.role === 'INFLUENCER' && data.tier) {
      await prisma.influencerProfile.create({
        data: {
          userId: user.id,
          currentTier: data.tier,
        },
      });
      console.log(`            Tier: ${data.tier}`);
    }
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

    // Update or create influencer profile for INFLUENCER role users
    if (data.role === 'INFLUENCER' && data.tier) {
      const existingProfile = await prisma.influencerProfile.findFirst({
        where: { userId: existing.id },
      });
      if (existingProfile) {
        await prisma.influencerProfile.update({
          where: { id: existingProfile.id },
          data: { currentTier: data.tier },
        });
        console.log(`            Tier updated: ${data.tier}`);
      } else {
        await prisma.influencerProfile.create({
          data: {
            userId: existing.id,
            currentTier: data.tier,
          },
        });
        console.log(`            Tier created: ${data.tier}`);
      }
    }
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
