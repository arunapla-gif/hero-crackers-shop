export const metadata = {
  title: 'Terms & Conditions | Hero Crackers Sivakasi',
  description: 'Terms of service, statutory compliance, and order quotation policies for Hero Crackers.',
};

export default function TermsPage() {
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
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#B8860B', fontWeight: 'bold' }}>Legal Agreement</span>
          <h1 style={{ color: '#800000', fontSize: '2.4rem', margin: '8px 0 0 0', fontFamily: 'var(--font-serif, serif)' }}>Terms & Conditions</h1>
          <p style={{ color: '#777', fontSize: '0.9rem', marginTop: '6px' }}>Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div style={{ lineHeight: '1.8', color: '#333', fontSize: '1rem' }}>
          <p style={{ marginBottom: '20px' }}>
            Welcome to <strong>Hero Crackers</strong> (operated by <strong>Arunachalam Agency</strong>). By accessing our website, browsing our product catalog, or submitting an estimate booking, you agree to abide by the following terms, conditions, and national fireworks regulations.
          </p>
          
          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>1. Order Processing & Quotation Model</h3>
          <p style={{ marginBottom: '15px' }}>
            In strict compliance with the <strong>2018 Supreme Court of India directive</strong> regarding the online sale of explosives and fireworks, this website does not process direct, instant financial transactions or credit card checkouts for firecrackers.
          </p>
          <p style={{ marginBottom: '20px' }}>
            All orders submitted through this portal function as <strong>Price Estimates, Enquiries, and Formal Quotations</strong>. Following order submission, our sales team confirms stock availability, applicable road transport freight, and provides delivery instructions.
          </p>
          
          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>2. Licensing & Statutory Authority</h3>
          <p style={{ marginBottom: '20px' }}>
            Arunachalam Agency / Hero Crackers is a fully licensed manufacturer and authorized dealer located in Sivakasi, Virudhunagar District, Tamil Nadu. We hold valid licenses from the Petroleum and Explosives Safety Organisation (PESO) and only distribute certified, high-grade fireworks adhering to national noise and emission standards.
          </p>
          
          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>3. Minimum Age Requirement</h3>
          <p style={{ marginBottom: '20px' }}>
            In accordance with the Indian Explosives Act, individuals under 18 years of age are prohibited from purchasing fireworks. By submitting an estimate, you certify that you are at least 18 years of age.
          </p>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>4. Limitation of Liability</h3>
          <p style={{ marginBottom: '20px' }}>
            Hero Crackers and Arunachalam Agency are not liable for any personal injuries, property damages, fire hazards, or legal penalties arising from the improper, reckless, or illegal storage, handling, or bursting of fireworks. Consumers are strictly advised to adhere to manufacturer instructions on every box and follow all local municipal time and noise restrictions.
          </p>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>5. Contact Information</h3>
          <div style={{ backgroundColor: '#fff9ed', padding: '18px 24px', borderRadius: '10px', borderLeft: '4px solid #D4AF37', marginTop: '15px' }}>
            <strong>Arunachalam Agency (Hero Crackers)</strong><br />
            17, Thattu Mettu Street, Sattur Road, Sivakasi, Virudhunagar, Tamil Nadu - 626123<br />
            Phone: <a href="tel:+919047488862" style={{ color: '#800000', textDecoration: 'none', fontWeight: 'bold' }}>+91 90474 88862</a><br />
            Email: <a href="mailto:admin@arunag.com" style={{ color: '#800000', textDecoration: 'none' }}>admin@arunag.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}
