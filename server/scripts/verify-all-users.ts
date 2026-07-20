// Run: npx ts-node scripts/verify-all-users.ts
// Marks all unverified users as verified (for development/testing)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Mark all unverified users as verified + active
  const result = await prisma.user.updateMany({
    where: { emailVerified: false, deletedAt: null },
    data:  { emailVerified: true, status: 'ACTIVE', isSuspended: false, lockedUntil: null, failedLoginAttempts: 0 },
  });

  console.log(`\n✅ Updated ${result.count} user(s) → emailVerified=true, status=ACTIVE`);

  // Show all users
  const users = await prisma.user.findMany({
    where:  { deletedAt: null },
    select: { email: true, status: true, emailVerified: true, role: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log('\nAll users:');
  users.forEach((u) =>
    console.log(`  ${u.emailVerified ? '✅' : '❌'} ${u.email.padEnd(40)} | ${u.status.padEnd(22)} | ${u.role}`)
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
