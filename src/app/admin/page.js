import prisma from '@/lib/prisma';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export const dynamic = 'force-dynamic'; // Always fetch fresh data for admin

export const metadata = {
  title: 'Admin Dashboard | Hero Crackers',
}

export default async function AdminDashboard() {
  const orders = await prisma.order.findMany({
    include: { items: true, user: true },
    orderBy: { createdAt: 'desc' }
  });

  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' }
  });

  return <AdminDashboardClient initialOrders={orders} products={products} />;
}
