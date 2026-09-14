'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Do not show the customer chat widget inside admin portal
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const phoneNumber = '919047488862';
  const message = encodeURIComponent(
    'Hello Hero Crackers! I would like to inquire about fireworks availability, price estimate, and transport to my location.'
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {/* Tooltip Label (Desktop hover) */}
      <span
        style={{
          backgroundColor: '#1E293B',
          color: '#F8FAFC',
          padding: '8px 14px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
          whiteSpace: 'nowrap',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateX(0)' : 'translateX(10px)',
          transition: 'all 0.25s ease',
          pointerEvents: 'none',
          display: 'none',
        }}
        className="whatsapp-tooltip"
      >
        Quick Inquiry on WhatsApp
      </span>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Hero Crackers on WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.45)',
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="currentColor"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.15c-.24.67-1.39 1.28-1.92 1.36-.51.08-1.16.11-3.34-.79-2.78-1.15-4.57-3.97-4.71-4.16-.14-.19-1.13-1.51-1.13-2.88 0-1.37.72-2.04.97-2.32.26-.28.56-.35.75-.35.19 0 .38 0 .54.01.17.01.41-.07.64.49.24.57.82 2 .89 2.15.07.15.12.33.02.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.32-.13.62.18.3 1.2 1.98 2.58 3.21 1.77 1.58 3.27 2.07 3.73 2.3.46.23.73.19 1-.12.27-.31 1.15-1.34 1.46-1.8.31-.46.62-.38 1.04-.23.42.15 2.67 1.26 3.13 1.49.46.23.77.34.88.53.11.19.11 1.1-.13 1.77z" />
        </svg>
      </a>

      <style jsx global>{`
        @media (min-width: 768px) {
          .whatsapp-tooltip {
            display: inline-block !important;
          }
        }
        @media (max-width: 768px) {
          /* Offset slightly above sticky cart button on mobile */
          div[style*="position: fixed"][style*="bottom: 24px"] {
            bottom: 80px !important;
            right: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}
