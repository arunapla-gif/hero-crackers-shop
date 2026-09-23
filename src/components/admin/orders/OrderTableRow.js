import React, { useState } from 'react';
import { formatOrderNumber } from '@/lib/utils';

const Spinner = () => (
  <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const OrderTableRow = React.memo(({ 
  order, 
  isSelected,
  onSelectOrder,
  expanded,
  onToggleExpand,
  onStatusChange,
  onOpenPaymentModal,
  onSetCredit,
  onWhatsAppSend,
  onPrintInvoice,
  onPrintLabel,
  loadingAction,
  products
}) => {

  const triggerPrint = () => {
    onPrintInvoice(order, products);
  };

  const triggerLabel = () => {
    onPrintLabel(order);
  };

  const paymentLabel = order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus === 'CREDIT' ? 'Credit / Later' : 'Unpaid';

  return (
    <div className={`admin-card admin-order-row status-${order.status} order-card`}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
        
        {/* Col 1: ID & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '150px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              className="custom-checkbox"
              checked={isSelected} 
              onChange={() => onSelectOrder(order.id)} 
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {formatOrderNumber(order.orderNumber, order.createdAt)}
            </span>
            {order.source === 'POS' ? (
              <span style={{ background: '#2196F3', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>🏬 POS</span>
            ) : (
              <span style={{ background: '#00E676', color: 'black', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>🌐 WEBSITE</span>
            )}
          </div>
          <div>
            <span className={`admin-order-badge ${order.status}`}>
              <span className="dot"></span>
              {order.status}
            </span>
          </div>
          <div style={{ marginTop: '4px' }}>
            <span className={`admin-payment-badge ${order.paymentStatus}`}>
              💰 {paymentLabel}
            </span>
          </div>
        </div>
        
        {/* Col 2: Customer Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1.5', minWidth: '250px' }}>
          <strong style={{ fontSize: '1.8rem', color: 'var(--admin-text-primary)', letterSpacing: '-1px', textDecoration: order.status === 'CANCELLED' ? 'line-through' : 'none' }}>
            ₹{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
          <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--admin-text-primary)', marginTop: '5px' }}>
            👤 {order.user?.name || 'Walk-in Customer'}
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--admin-text-secondary)' }}>
            📞 <strong style={{ color: 'var(--admin-text-primary)' }}>{order.customerPhone || 'N/A'}</strong>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--admin-text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
            📍 {order.shippingAddress}
          </div>
          {order.remarks && (
            <div style={{ fontSize: '0.85rem', color: 'var(--admin-info)', marginTop: '4px', fontWeight: 'bold', padding: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: '6px' }}>
              📝 Note: {order.remarks}
            </div>
          )}
          {order.referredBy && (
            <div style={{ fontSize: '0.85rem', color: 'var(--admin-accent)', marginTop: '4px', fontWeight: 'bold' }}>
              🏷️ Referred By: {order.referredBy}
            </div>
          )}
          {(order.transportName || order.trackingNumber) && (
            <div style={{ fontSize: '0.85rem', color: 'var(--admin-shipped)', marginTop: '4px', fontWeight: 'bold' }}>
              LR: {order.trackingNumber} ({order.transportName})
            </div>
          )}
          {order.paymentStatus === 'PAID' && order.paymentMethod && (
            <div style={{ fontSize: '0.85rem', color: 'var(--admin-success)', marginTop: '4px', fontWeight: 'bold' }}>
              Paid via {order.paymentMethod} {order.paymentDetails ? `(${order.paymentDetails})` : ''}
            </div>
          )}
        </div>

        {/* Col 3: Items Toggle */}
        <div style={{ flex: '1', minWidth: '150px', padding: '0 15px', borderLeft: `1px solid var(--admin-border)`, borderRight: `1px solid var(--admin-border)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button 
            onClick={() => onToggleExpand(order.id)}
            className="admin-btn-secondary"
            style={{ padding: '10px 15px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px' }}
          >
            <span>📦 {order.items.length} Items</span>
            <span>{expanded ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Col 4: Actions */}
        <div style={{ flex: '1.5', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Status Actions (Primary focus) */}
          {order.status !== 'CANCELLED' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
              
              {/* PENDING -> CONFIRMED */}
              {order.status === 'PENDING' && (
                <button className="admin-btn-primary action-btn admin-btn-compact" disabled={loadingAction?.id === order.id && loadingAction?.action === 'CONFIRMED'} onClick={() => onStatusChange(order.id, 'CONFIRMED')} style={{ gridColumn: 'span 2', backgroundColor: 'var(--admin-confirmed)', color: '#fff' }}>
                  {loadingAction?.id === order.id && loadingAction?.action === 'CONFIRMED' ? <Spinner /> : null}
                  {loadingAction?.id === order.id && loadingAction?.action === 'CONFIRMED' ? 'Confirming...' : 'Confirm Order'}
                </button>
              )}

              {/* CONFIRMED -> PROCESSING (Requires Payment Check) */}
              {order.status === 'CONFIRMED' && order.paymentStatus !== 'UNPAID' && (
                <button className="admin-btn-primary admin-btn-info action-btn admin-btn-compact" disabled={loadingAction?.id === order.id && loadingAction?.action === 'PROCESSING'} onClick={() => onStatusChange(order.id, 'PROCESSING')} style={{ gridColumn: 'span 2' }}>
                  {loadingAction?.id === order.id && loadingAction?.action === 'PROCESSING' ? <Spinner /> : null}
                  {loadingAction?.id === order.id && loadingAction?.action === 'PROCESSING' ? 'Processing...' : 'Start Processing'}
                </button>
              )}
              {order.status === 'CONFIRMED' && order.paymentStatus === 'UNPAID' && (
                <div style={{ gridColumn: 'span 2', fontSize: '0.8rem', color: 'var(--admin-danger)', textAlign: 'center', padding: '6px', border: '1px solid var(--admin-danger)', borderRadius: '6px', backgroundColor: 'rgba(239,68,68,0.1)', fontWeight: 'bold' }}>
                  ⚠️ Payment Required for Processing
                </div>
              )}

              {/* PROCESSING -> PACKED */}
              {order.status === 'PROCESSING' && (
                <button className="admin-btn-primary action-btn admin-btn-compact" disabled={loadingAction?.id === order.id && loadingAction?.action === 'PACKED'} onClick={() => onStatusChange(order.id, 'PACKED')} style={{ gridColumn: 'span 2', backgroundColor: 'var(--admin-packed)' }}>
                  {loadingAction?.id === order.id && loadingAction?.action === 'PACKED' ? <Spinner /> : null}
                  {loadingAction?.id === order.id && loadingAction?.action === 'PACKED' ? 'Packing...' : 'Pack Order'}
                </button>
              )}

              {/* PACKED -> SHIPPED */}
              {order.status === 'PACKED' && (
                <button className="admin-btn-primary admin-btn-shipped action-btn admin-btn-compact" disabled={loadingAction?.id === order.id && loadingAction?.action === 'SHIPPED'} onClick={() => onStatusChange(order.id, 'SHIPPED')} style={{ gridColumn: 'span 2' }}>
                  {loadingAction?.id === order.id && loadingAction?.action === 'SHIPPED' ? <Spinner /> : null}
                  {loadingAction?.id === order.id && loadingAction?.action === 'SHIPPED' ? 'Dispatching...' : 'Dispatch'}
                </button>
              )}

              {/* SHIPPED -> DELIVERED */}
              {order.status === 'SHIPPED' && (
                <button className="admin-btn-primary admin-btn-success action-btn admin-btn-compact" disabled={loadingAction?.id === order.id && loadingAction?.action === 'DELIVERED'} onClick={() => onStatusChange(order.id, 'DELIVERED')} style={{ gridColumn: 'span 2' }}>
                  {loadingAction?.id === order.id && loadingAction?.action === 'DELIVERED' ? <Spinner /> : null}
                  {loadingAction?.id === order.id && loadingAction?.action === 'DELIVERED' ? 'Delivering...' : 'Deliver Order'}
                </button>
              )}

              {/* CANCELLED is allowed until SHIPPED */}
              {['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED'].includes(order.status) && (
                <button className="admin-btn-danger action-btn admin-btn-compact" disabled={loadingAction?.id === order.id && loadingAction?.action === 'CANCELLED'} onClick={() => onStatusChange(order.id, 'CANCELLED')} style={{ gridColumn: 'span 2', borderRadius: '30px' }}>
                  {loadingAction?.id === order.id && loadingAction?.action === 'CANCELLED' ? <Spinner /> : null}
                  {loadingAction?.id === order.id && loadingAction?.action === 'CANCELLED' ? 'Cancelling...' : '✕ Cancel'}
                </button>
              )}
            </div>
          )}

          {/* Payment Actions */}
          {order.status !== 'CANCELLED' && order.paymentStatus === 'UNPAID' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
              <button className="admin-btn-primary admin-btn-success action-btn admin-btn-compact" onClick={() => onOpenPaymentModal(order.id)}>Mark Paid</button>
              <button className="admin-btn-primary admin-btn-shipped action-btn admin-btn-compact" onClick={() => onSetCredit(order.id)}>Set Credit</button>
            </div>
          )}
          {order.status !== 'CANCELLED' && order.paymentStatus === 'CREDIT' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', width: '100%' }}>
              <button className="admin-btn-primary admin-btn-success action-btn admin-btn-compact" onClick={() => onOpenPaymentModal(order.id)}>Collect Payment</button>
            </div>
          )}

          {/* WhatsApp Smart Button */}
          {order.customerPhone && (
            <button 
              className="action-btn"
              disabled={loadingAction?.id === order.id && loadingAction?.action === 'whatsapp'}
              onClick={() => onWhatsAppSend(order.id)}
              title="Send automated PDF via WhatsApp API"
              style={{ 
                width: '100%', 
                padding: '10px', 
                backgroundColor: order.lastSentVersion === 0 ? 'var(--admin-info)' : (order.lastSentVersion < order.editVersion ? 'var(--admin-accent)' : 'var(--admin-success)'), 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                fontSize: '0.9rem', 
                fontWeight: 'bold', 
                gap: '8px'
              }}
            >
              {loadingAction?.id === order.id && loadingAction?.action === 'whatsapp' ? (
                <>
                  <Spinner /> Sending...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  {order.lastSentVersion === 0 
                    ? "Send Initial Bill (v1)" 
                    : (order.lastSentVersion < order.editVersion 
                        ? `Send Updated Bill (v${order.editVersion})` 
                        : `Sent v${order.editVersion} (Resend?)`)}
                </>
              )}
            </button>
          )}

          {/* Utility Actions (Icon + Text) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button className="admin-btn-secondary action-btn icon-btn-alive admin-btn-compact" onClick={triggerPrint} title="Print Invoice" style={{ gridColumn: 'span 2' }}>
              🖨️ Print Invoice
            </button>
            <button className="admin-btn-secondary action-btn icon-btn-alive admin-btn-compact" onClick={triggerLabel} title="Print Shipping Label (4x6 Sticker)" style={{ gridColumn: 'span 2' }}>
              🏷️ Print Label
            </button>
          </div>
          
        </div>
      </div>

      {/* Expanded Items Drawer */}
      {expanded && (
        <div style={{ marginTop: '20px', borderTop: `1px solid var(--admin-border)`, paddingTop: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: 'var(--admin-input-bg)', borderRadius: '8px', border: `1px solid var(--admin-border)` }}>
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--admin-text-primary)', borderBottom: `1px solid var(--admin-border)`, paddingBottom: '10px' }}>Order Items ({order.items.length})</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', color: 'var(--admin-text-secondary)', borderBottom: `1px solid var(--admin-border)` }}>Product</th>
                  <th style={{ padding: '8px', color: 'var(--admin-text-secondary)', borderBottom: `1px solid var(--admin-border)`, textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px', color: 'var(--admin-text-secondary)', borderBottom: `1px solid var(--admin-border)`, textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '8px', color: 'var(--admin-text-secondary)', borderBottom: `1px solid var(--admin-border)`, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <tr key={item.id}>
                      <td style={{ padding: '8px', color: 'var(--admin-text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {product?.images?.[0] ? (
                            <img src={product.images[0]} alt="" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <div style={{ width: '30px', height: '30px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '4px' }} />
                          )}
                          <span>{product ? product.name : 'Unknown Product'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px', color: 'var(--admin-text-primary)', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                      <td style={{ padding: '8px', color: 'var(--admin-text-secondary)', textAlign: 'right' }}>₹{item.price}</td>
                      <td style={{ padding: '8px', color: 'var(--admin-text-primary)', textAlign: 'right', fontWeight: 'bold' }}>₹{item.price * item.quantity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

export default OrderTableRow;
