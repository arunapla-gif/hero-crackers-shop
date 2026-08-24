import prisma from '@/lib/prisma';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic'; // Ensure we always fetch fresh admins

export default async function AdminLoginPage() {
  // Fetch all admin users
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      name: true,
      email: true,
    }
  });

  return <LoginClient admins={admins} />;
}
