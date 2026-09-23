import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';

export async function GET(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter = {};
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date

      dateFilter.gte = new Date(startDate);
      dateFilter.lte = end;
    }

    const ordersWhere = startDate && endDate ? { createdAt: dateFilter } : {};
    
    // Fetch products for item names
    const products = await prisma.product.findMany({ select: { id: true, name: true } });
    
    // Fetch Orders
    const orders = await prisma.order.findMany({
      where: ordersWhere,
      include: {
        items: true,
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const validStatuses = ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];
    const validOrders = orders.filter(o => validStatuses.includes(o.status));

    // 1. Sales Summary
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const paidRevenue = validOrders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.totalAmount, 0);
    const unpaidRevenue = validOrders.filter(o => o.paymentStatus !== 'PAID').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = validOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const salesSummary = { totalRevenue, paidRevenue, unpaidRevenue, totalOrders, avgOrderValue };

    // 2. Item-Wise Sales
    const itemMap = {};
    validOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemMap[item.productId]) {
          const product = products.find(p => p.id === item.productId);
          itemMap[item.productId] = {
            id: item.productId,
            name: product ? product.name : 'Unknown Product',
            qty: 0,
            revenue: 0
          };
        }
        itemMap[item.productId].qty += item.quantity;
        itemMap[item.productId].revenue += (item.price * item.quantity);
      });
    });
    const itemWiseSales = Object.values(itemMap).sort((a, b) => b.revenue - a.revenue);

    // 3. Agent Performance
    const agentMap = {};
    validOrders.forEach(order => {
      const agentName = order.referredBy || 'Direct (No Agent)';
      if (!agentMap[agentName]) {
        agentMap[agentName] = { name: agentName, orderCount: 0, totalRevenue: 0, orders: [] };
      }
      agentMap[agentName].orderCount += 1;
      agentMap[agentName].totalRevenue += order.totalAmount;
      
      // Keep only lightweight order data for the frontend modal
      agentMap[agentName].orders.push({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || order.customerName,
        shippingAddress: order.shippingAddress,
        status: order.status,
        totalAmount: order.totalAmount,
        remarks: order.remarks,
        user: order.user // for fallback in UI
      });
    });
    const agentPerformance = Object.values(agentMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // 4. Transport Logs
    const tMap = {};
    const shippedOrders = validOrders.filter(o => o.status === 'SHIPPED' || o.status === 'DELIVERED');
    shippedOrders.forEach(order => {
      const tName = order.transportName || 'Unknown Transport';
      if (!tMap[tName]) {
        tMap[tName] = { name: tName, parcelCount: 0, totalValue: 0 };
      }
      tMap[tName].parcelCount += 1;
      tMap[tName].totalValue += order.totalAmount;
    });
    const transportLogs = Object.values(tMap).sort((a, b) => b.parcelCount - a.parcelCount);

    // 5. P&L
    const expensesWhere = startDate && endDate ? { date: dateFilter } : {};
    const expenses = await prisma.expense.findMany({
      where: expensesWhere,
      orderBy: { date: 'desc' }
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = paidRevenue - totalExpenses;
    
    const expenseByCategory = {};
    expenses.forEach(e => {
      if (!expenseByCategory[e.category]) expenseByCategory[e.category] = 0;
      expenseByCategory[e.category] += e.amount;
    });
    const pnl = {
      totalExpenses,
      netProfit,
      expenseByCategory: Object.entries(expenseByCategory).sort((a,b) => b[1] - a[1])
    };

    return NextResponse.json({
      salesSummary,
      itemWiseSales,
      agentPerformance,
      transportLogs,
      pnl
    });
  } catch (error) {
    console.error('Failed to fetch report data:', error);
    return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
  }
}
