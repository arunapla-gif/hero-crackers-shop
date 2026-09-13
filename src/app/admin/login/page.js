import prisma from '@/lib/prisma';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic'; // Ensure we always fetch fresh admins

const defaultAdmins = [
  { id: 'admin-default', name: 'Hero Admin', email: 'admin@herocrackers.com' }
];

export default async function AdminLoginPage() {
  let admins = defaultAdmins;
  try {
    const dbAdmins = await Promise.race([
      prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, name: true, email: true }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 600))
    ]);
    if (dbAdmins && dbAdmins.length > 0) {
      admins = dbAdmins;
    }
  } catch (e) {
    // If DB is slow or offline, use default admin profile instantly
  }

  return <LoginClient admins={admins} />;
}
