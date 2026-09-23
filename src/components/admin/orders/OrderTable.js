import OrderTableRow from './OrderTableRow';

export default function OrderTable({
  orders,
  selectedOrders,
  handleSelectOrder,
  expandedOrderId,
  setExpandedOrderId,
  handleStatusChange,
  setPaymentOrderId,
  handleSetCredit,
  handleWhatsAppSend,
  printInvoice,
  printShippingLabel,
  loadingAction,
  products,
  onEditOrder,
  onDuplicateOrder,
  onRepeatOrder
}) {

  const handleToggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {orders.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No orders found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        orders.map(order => (
          <OrderTableRow
            key={order.id}
            order={order}
            isSelected={selectedOrders.includes(order.id)}
            onSelectOrder={handleSelectOrder}
            expanded={expandedOrderId === order.id}
            onToggleExpand={handleToggleExpand}
            onStatusChange={handleStatusChange}
            onOpenPaymentModal={setPaymentOrderId}
            onSetCredit={handleSetCredit}
            onWhatsAppSend={handleWhatsAppSend}
            onPrintInvoice={printInvoice}
            onPrintLabel={printShippingLabel}
            loadingAction={loadingAction}
            products={products}
            onEditOrder={onEditOrder}
            onDuplicateOrder={onDuplicateOrder}
            onRepeatOrder={onRepeatOrder}
          />
        ))
      )}
    </div>
  );
}
