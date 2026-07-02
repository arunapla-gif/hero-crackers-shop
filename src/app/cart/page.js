'use client';

export default function CartPage() {
  return (
    <div style={{ padding: '50px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '30px' }}>
        Your Shopping Cart
      </h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Cart Items List */}
        <div style={{ flex: '1 1 600px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>Img</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-dark)' }}>Sivakasi Royal Chakkars</h3>
                <p style={{ color: '#666' }}>Pack of 10</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>₹1,299</p>
              <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '5px 10px' }}>Qty: 1</div>
              <button style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>X</button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--color-primary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 'bold' }}>₹1,299.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Shipping</span>
              <span style={{ color: 'green', fontWeight: 'bold' }}>FREE</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #eee', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              <span>Total</span>
              <span>₹1,299.00</span>
            </div>

            <button style={{
              width: '100%',
              marginTop: '30px',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              padding: '15px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-primary-light)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
            >
              Submit Estimate & Request Call
            </button>
            
            <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
              We will call you to confirm shipping logistics before payment.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
