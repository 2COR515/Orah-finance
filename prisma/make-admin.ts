/**
 * Script to promote a user to ADMIN role
 * Usage: npx ts-node prisma/make-admin.ts <email>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    await prisma.user.update({
      where: { email },
      data: { 
        role: 'ADMIN',
        emailVerified: new Date(), // Auto-verify admin
      },
    });

    // Give admin PREMIUM subscription for free
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        tier: 'PREMIUM',
        status: 'ACTIVE',
        priceKES: 0,
        endDate: new Date('2030-12-31'),
      },
      create: {
        userId: user.id,
        tier: 'PREMIUM',
        status: 'ACTIVE',
        priceKES: 0,
        endDate: new Date('2030-12-31'),
      },
    });

    console.log(`✅ ${email} is now an ADMIN with PREMIUM subscription`);
    console.log(`   Name: ${user.name}`);
    console.log(`   ID: ${user.id}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: npx ts-node prisma/make-admin.ts <email>');
  console.log('Example: npx ts-node prisma/make-admin.ts trevor@example.com');
  process.exit(1);
}

makeAdmin(email);
