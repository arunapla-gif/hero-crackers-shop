import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const Spinner = () => (
  <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px', marginRight: '8px' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default function OrderModals({ 
  transports,
  dispatchOrderId, 
  setDispatchOrderId,
  paymentOrderId,
  setPaymentOrderId
}) {
  const queryClient = useQueryClient();

  // Dispatch State
  const [transportName, setTransportName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentDetails, setPaymentDetails] = useState('');

  const [loadingAction, setLoadingAction] = useState(null);

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, data }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    }
  });

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!dispatchOrderId) return;
    
    setLoadingAction('dispatch');
    try {
      await updateOrderMutation.mutateAsync({ 
        orderId: dispatchOrderId, 
        data: { status: 'SHIPPED', transportName, trackingNumber } 
      });
      setDispatchOrderId(null);
      setTransportName('');
      setTrackingNumber('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentOrderId) return;
    
    setLoadingAction('payment');
    try {
      await updateOrderMutation.mutateAsync({ 
        orderId: paymentOrderId, 
        data: { paymentStatus: 'PAID', paymentMethod, paymentDetails } 
      });
      setPaymentOrderId(null);
      setPaymentMethod('CASH');
      setPaymentDetails('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      
      {/* Modal Overlay for Dispatch */}
      {dispatchOrderId && (
        <div className="admin-modal-overlay">
          <div className="admin-card admin-modal-content">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: 'var(--admin-text-primary)' }}>Dispatch Order</h3>
            <form onSubmit={handleDispatchSubmit}>
              <label className="admin-form-label">Transport / Courier Agency</label>
              <select required value={transportName} onChange={e => setTransportName(e.target.value)} className="admin-form-input">
                <option value="">Select an Agency...</option>
                {transports && transports.filter(t => t.isActive).map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <label className="admin-form-label">Lorry Receipt (LR) / Tracking Number</label>
              <input type="text" required value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="admin-form-input" placeholder="e.g. LR-98765432" />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setDispatchOrderId(null)} className="admin-btn-secondary action-btn" style={{ flex: 1, boxShadow: 'none' }}>Cancel</button>
                <button type="submit" disabled={loadingAction === 'dispatch'} className="admin-btn-primary action-btn" style={{ flex: 1 }}>
                  {loadingAction === 'dispatch' ? <Spinner /> : null}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Overlay for Payment */}
      {paymentOrderId && (
        <div className="admin-modal-overlay">
          <div className="admin-card admin-modal-content">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: 'var(--admin-text-primary)' }}>Record Payment</h3>
            <form onSubmit={handlePaymentSubmit}>
              <label className="admin-form-label">Payment Method</label>
              <select required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="admin-form-input">
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="BANK">Bank Transfer</option>
              </select>
              
              <label className="admin-form-label">Transaction ID / Notes</label>
              <input type="text" value={paymentDetails} onChange={e => setPaymentDetails(e.target.value)} className="admin-form-input" placeholder="e.g. UTR-98765432" />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setPaymentOrderId(null)} className="admin-btn-secondary action-btn" style={{ flex: 1, boxShadow: 'none' }}>Cancel</button>
                <button type="submit" disabled={loadingAction === 'payment'} className="admin-btn-primary admin-btn-success action-btn" style={{ flex: 1 }}>
                  {loadingAction === 'payment' ? <Spinner /> : null}
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
