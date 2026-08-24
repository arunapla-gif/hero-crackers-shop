import prisma from '@/lib/prisma';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import ReactQueryProvider from '@/components/ReactQueryProvider';

export const dynamic = 'force-dynamic'; // Always fetch fresh data for admin

export const metadata = {
  title: 'Admin Dashboard | Hero Crackers',
}

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Execute all database queries in parallel to significantly reduce page load time
  const [
    orders,
    products,
    categories,
    godowns,
    references,
    transports,
    expenses,
    customers
  ] = await Promise.all([
    prisma.order.findMany({
      include: { items: true, user: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.product.findMany({
      orderBy: [
        { sequence: 'asc' },
        { name: 'asc' }
      ]
    }),
    prisma.category.findMany({
      orderBy: { sequence: 'asc' }
    }),
    prisma.godown.findMany({
      include: { stocks: true },
      orderBy: { name: 'asc' }
    }),
    prisma.referenceMaster.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.transportMaster.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.expense.findMany({
      where: { date: { gte: today } },
      orderBy: { date: 'desc' }
    }),
    prisma.customerMaster.findMany({
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <ReactQueryProvider>
      <AdminDashboardClient 
        initialOrders={JSON.parse(JSON.stringify(orders))} 
        initialProducts={JSON.parse(JSON.stringify(products))} 
        categories={JSON.parse(JSON.stringify(categories))}
        initialGodowns={JSON.parse(JSON.stringify(godowns))}
        initialReferences={JSON.parse(JSON.stringify(references))}
        initialTransports={JSON.parse(JSON.stringify(transports))}
        initialExpenses={JSON.parse(JSON.stringify(expenses))}
        initialCustomers={JSON.parse(JSON.stringify(customers))}
      />
    </ReactQueryProvider>
  );
}
