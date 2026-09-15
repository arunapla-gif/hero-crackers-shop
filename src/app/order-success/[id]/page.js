'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const orderId = params.id;
  const orderNumber = searchParams.get('orderNumber') || orderId;
  const totalAmount = searchParams.get('total') || 'Calculated later';

  // WhatsApp Message Formatting
  const phoneNumber = '919047488862'; // Standard shop number
  const message = `Hello Hero Crackers! I just placed an order on your website.\n\n*Order ID:* ${orderNumber}\n*Total Estimate:* ₹${totalAmount}\n\nPlease confirm the final amount including transport so I can make the payment.`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '24px',
        padding: '50px 30px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}>
        
        {/* Success Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: '#E8F5E9',
          color: '#4CAF50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          margin: '0 auto 30px auto',
          boxShadow: '0 10px 25px rgba(76, 175, 80, 0.2)'
        }}>
          ✓
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#1A1A1A', marginBottom: '15px' }}>
          Estimate Requested!
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
          Thank you for choosing Hero Crackers. Your estimate request has been securely placed. No payment has been charged yet.
        </p>

        {/* Order Details Card */}
        <div style={{
          backgroundColor: '#fafafa',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '40px',
          border: '1px dashed #ccc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#888' }}>Order Reference:</span>
            <span style={{ fontWeight: 'bold', color: '#333' }}>{orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Total Estimate:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{Number(totalAmount).toLocaleString()}</span>
          </div>
        </div>

        {/* Action Steps */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '15px' }}>Next Steps:</h3>
          <p style={{ color: '#555', marginBottom: '20px' }}>
            Please send your Order ID to our WhatsApp so we can confirm transport charges and share payment details.
          </p>
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              backgroundColor: '#25D366',
              color: '#fff',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '30px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 8px 20px rgba(37, 211, 102, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.15c-.24.67-1.39 1.28-1.92 1.36-.51.08-1.16.11-3.34-.79-2.78-1.15-4.57-3.97-4.71-4.16-.14-.19-1.13-1.51-1.13-2.88 0-1.37.72-2.04.97-2.32.26-.28.56-.35.75-.35.19 0 .38 0 .54.01.17.01.41-.07.64.49.24.57.82 2 .89 2.15.07.15.12.33.02.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.32-.13.62.18.3 1.2 1.98 2.58 3.21 1.77 1.58 3.27 2.07 3.73 2.3.46.23.73.19 1-.12.27-.31 1.15-1.34 1.46-1.8.31-.46.62-.38 1.04-.23.42.15 2.67 1.26 3.13 1.49.46.23.77.34.88.53.11.19.11 1.1-.13 1.77z" />
            </svg>
            Send Order to WhatsApp
          </a>
        </div>

        <Link 
          href="/shop" 
          style={{ 
            color: 'var(--color-primary)', 
            textDecoration: 'none', 
            fontWeight: '600',
            borderBottom: '2px solid transparent',
            transition: 'border-color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
        >
          ← Return to Shop
        </Link>
        
        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
