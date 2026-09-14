export const metadata = {
  title: 'Privacy Policy | Hero Crackers Sivakasi',
  description: 'Learn how Hero Crackers protects your personal information and respects customer privacy.',
};

export default function PrivacyPage() {
  return (
    <div style={{ padding: '60px 20px', minHeight: '80vh', backgroundColor: '#fcf8f2' }}>
      <div style={{ 
        maxWidth: '850px', 
        margin: '0 auto', 
        backgroundColor: '#ffffff', 
        borderRadius: '16px', 
        padding: '40px 50px', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        border: '1px solid rgba(212,175,55,0.2)'
      }}>
        <div style={{ borderBottom: '2px solid #D4AF37', paddingBottom: '20px', marginBottom: '30px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#B8860B', fontWeight: 'bold' }}>Legal & Compliance</span>
          <h1 style={{ color: '#800000', fontSize: '2.4rem', margin: '8px 0 0 0', fontFamily: 'var(--font-serif, serif)' }}>Privacy Policy</h1>
          <p style={{ color: '#777', fontSize: '0.9rem', marginTop: '6px' }}>Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div style={{ lineHeight: '1.8', color: '#333', fontSize: '1rem' }}>
          <p style={{ marginBottom: '20px' }}>
            At <strong>Hero Crackers</strong> (a venture of <strong>Arunachalam Agency</strong>), we value your trust and are committed to protecting your personal information. This Privacy Policy describes how we collect, use, and safeguard your data when you visit our website or submit an estimate request for fireworks.
          </p>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>1. Information We Collect</h3>
          <p style={{ marginBottom: '15px' }}>
            When you submit an estimate or inquiry through our website, we may collect:
          </p>
          <ul style={{ paddingLeft: '25px', marginBottom: '20px', color: '#444' }}>
            <li><strong>Personal Contact Information:</strong> Name, 10-digit mobile number, and email address.</li>
            <li><strong>Delivery Details:</strong> Complete street address, town/district, state, and pincode to calculate transport depot delivery.</li>
            <li><strong>Order Preferences:</strong> Products and quantities requested in your estimate cart.</li>
            <li><strong>Technical Data:</strong> IP address, device type, and browser session data for fraud prevention and rate limiting.</li>
          </ul>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>2. How We Use Your Information</h3>
          <p style={{ marginBottom: '15px' }}>
            Your information is collected solely for legitimate business operations, including:
          </p>
          <ul style={{ paddingLeft: '25px', marginBottom: '20px', color: '#444' }}>
            <li>Generating authoritative price estimates and downloadable PDF quotations.</li>
            <li>Sending automated WhatsApp order confirmations, dispatch receipts, and transport LR copy updates.</li>
            <li>Coordinating road transport parcel booking to your nearest transport hub.</li>
            <li>Preventing automated bot spam and safeguarding website infrastructure.</li>
          </ul>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>3. Zero Third-Party Data Sharing</h3>
          <p style={{ marginBottom: '20px' }}>
            <strong>We do not sell, rent, or trade your personal information</strong> to any third parties or marketing brokers. Your delivery details are only shared with registered transport logistics agencies (e.g., parcel service companies) strictly for dispatch and consignment tracking.
          </p>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>4. Data Security</h3>
          <p style={{ marginBottom: '20px' }}>
            All communications with our platform are encrypted with high-grade SSL/TLS (HTTPS). Password credentials and authentication tokens are secured with industry-standard bcrypt encryption, and our databases are protected with strict Row-Level Security (RLS) policies.
          </p>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>5. Contact Us Regarding Your Privacy</h3>
          <p style={{ marginBottom: '10px' }}>
            If you have questions or wish to request data correction or deletion, please reach out to our grievance officer:
          </p>
          <div style={{ backgroundColor: '#fff9ed', padding: '18px 24px', borderRadius: '10px', borderLeft: '4px solid #D4AF37', marginTop: '15px' }}>
            <strong>Arunachalam Agency (Hero Crackers)</strong><br />
            17, Thattu Mettu Street, Sattur Road, Sivakasi, Tamil Nadu - 626123<br />
            Phone: <a href="tel:+919047488862" style={{ color: '#800000', textDecoration: 'none', fontWeight: 'bold' }}>+91 90474 88862</a><br />
            Email: <a href="mailto:admin@arunag.com" style={{ color: '#800000', textDecoration: 'none' }}>admin@arunag.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}
