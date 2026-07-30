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

  const references = await prisma.referenceMaster.findMany({
    orderBy: { name: 'asc' }
  });

  const transports = await prisma.transportMaster.findMany({
    orderBy: { name: 'asc' }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: today } },
    orderBy: { date: 'desc' }
  });

  const customers = await prisma.customerMaster.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <ReactQueryProvider>
      <AdminDashboardClient 
        initialOrders={orders} 
        initialProducts={products} 
        initialCategories={JSON.parse(JSON.stringify(categories))}
        initialGodowns={JSON.parse(JSON.stringify(godowns))}
        initialReferences={JSON.parse(JSON.stringify(references))}
        initialTransports={JSON.parse(JSON.stringify(transports))}
        initialExpenses={JSON.parse(JSON.stringify(expenses))}
        initialCustomers={JSON.parse(JSON.stringify(customers))}
      />
    </ReactQueryProvider>
  );
}
