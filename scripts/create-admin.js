require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const dbUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2] || 'admin@herocrackers.com';
  const rawPassword = process.argv[3] || 'HeroAdmin@2024';

  console.log(`Checking if admin user with email ${email} exists...`);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`Updating password for existing admin: ${email}`);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Successfully updated existing admin password.');
  } else {
    console.log(`Creating new admin user: ${email}`);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    await prisma.user.create({
      data: {
        name: 'Hero Admin',
        email: email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Successfully created new admin user.');
  }

  console.log('---');
  console.log(`Email: ${email}`);
  console.log(`Password: ${rawPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
