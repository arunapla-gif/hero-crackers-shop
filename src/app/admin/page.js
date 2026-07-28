import prisma from '@/lib/prisma';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import ReactQueryProvider from '@/components/ReactQueryProvider';

export const dynamic = 'force-dynamic'; // Always fetch fresh data for admin

export const metadata = {
  title: 'Admin Dashboard | Hero Crackers',
}

export default async function AdminDashboard() {
  const orders = await prisma.order.findMany({
    include: { items: true, user: true },
    orderBy: { createdAt: 'desc' },
    take: 50 // Only fetch the first 50 initially for performance
  });

  const products = await prisma.product.findMany({
    orderBy: [
      { sequence: 'asc' },
      { name: 'asc' }
    ]
  });

  const categories = await prisma.category.findMany({
    orderBy: { sequence: 'asc' }
  });

  const godowns = await prisma.godown.findMany({
    include: { stocks: true },
    orderBy: { name: 'asc' }
  });

  return (
    <ReactQueryProvider>
      <AdminDashboardClient initialOrders={orders} initialProducts={products} categories={categories} initialGodowns={godowns} />
    </ReactQueryProvider>
  );
}
