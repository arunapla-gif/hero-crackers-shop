export const metadata = {
  title: 'Shipping & Delivery Policy | Hero Crackers Sivakasi',
  description: 'Understand how fireworks orders are packed, dispatched via registered road parcel transport, and delivered across India.',
};

export default function ShippingPage() {
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
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#B8860B', fontWeight: 'bold' }}>Logistics & Transport</span>
          <h1 style={{ color: '#800000', fontSize: '2.4rem', margin: '8px 0 0 0', fontFamily: 'var(--font-serif, serif)' }}>Shipping & Delivery Policy</h1>
          <p style={{ color: '#777', fontSize: '0.9rem', marginTop: '6px' }}>Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div style={{ lineHeight: '1.8', color: '#333', fontSize: '1rem' }}>
          <div style={{ backgroundColor: '#fff4e5', borderLeft: '4px solid #ff9800', padding: '16px 20px', borderRadius: '8px', marginBottom: '25px', color: '#663c00' }}>
            <strong>Important Statutory Notice:</strong> In accordance with the Petroleum and Explosives Safety Organisation (PESO) regulations and the Indian Explosives Act, firecrackers <strong>cannot</strong> be transported via Air Courier, Indian Postal Service, or passenger trains. All consignments are dispatched exclusively via licensed road parcel transport services.
          </div>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>1. Delivery Mode: Transport Hub Godown Pickup</h3>
          <p style={{ marginBottom: '15px' }}>
            Consignments booked from Sivakasi are routed through registered road transport parcel services (such as VRL, Associated Road Carriers, Rathimeena, Muthumari, or local express lorry services).
          </p>
          <ul style={{ paddingLeft: '25px', marginBottom: '20px', color: '#444' }}>
            <li>Orders are delivered to the <strong>nearest transport branch/godown office</strong> in your district or town.</li>
            <li>Customers collect the parcel from the transport hub upon presenting the Lorry Receipt (LR) number or transport bill copy sent to their registered WhatsApp/mobile number.</li>
            <li>Door delivery is subject to the transport company's local branch policies and local vehicle entry regulations.</li>
          </ul>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>2. Dispatch Timelines</h3>
          <ul style={{ paddingLeft: '25px', marginBottom: '20px', color: '#444' }}>
            <li><strong>Off-Peak Season (January to August):</strong> Dispatched within 24 to 48 hours of order confirmation. Delivery takes 3 to 7 working days depending on the destination state.</li>
            <li><strong>Deepavali Peak Season (September to November):</strong> Dispatches occur daily from our Sivakasi godowns. Because highway parcel traffic is heavy during festival rush, we recommend booking your estimate at least 15 to 20 days ahead of Deepavali to guarantee timely arrival.</li>
          </ul>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>3. Freight / Transport Charges</h3>
          <p style={{ marginBottom: '20px' }}>
            Estimated prices displayed on the website are for the products packed at our Sivakasi godown. Transport parcel freight charges are paid by the customer directly to the transport company upon collecting the parcel (To-Pay basis), or as agreed during order confirmation.
          </p>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>4. Order Cancellation & Transit Safety</h3>
          <p style={{ marginBottom: '15px' }}>
            Orders can be modified or cancelled free of charge <strong>prior to consignment packing and lorry booking</strong>. Once a parcel is handed over to the transport agency and an LR number is generated, cancellation is no longer possible.
          </p>
          <p style={{ marginBottom: '20px' }}>
            All fireworks are packed in heavy-duty, moisture-resistant corrugated boxes with reinforced strapping to prevent transit vibration and damage.
          </p>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>5. Transport Tracking Support</h3>
          <p style={{ marginBottom: '10px' }}>
            For tracking updates or questions regarding your shipment, reach out to our Sivakasi dispatch desk:
          </p>
          <div style={{ backgroundColor: '#fff9ed', padding: '18px 24px', borderRadius: '10px', borderLeft: '4px solid #D4AF37', marginTop: '15px' }}>
            <strong>Hero Crackers Dispatch Desk</strong><br />
            Phone / WhatsApp: <a href="https://wa.me/919047488862" target="_blank" rel="noopener noreferrer" style={{ color: '#800000', textDecoration: 'none', fontWeight: 'bold' }}>+91 90474 88862</a><br />
            Email: <a href="mailto:admin@arunag.com" style={{ color: '#800000', textDecoration: 'none' }}>admin@arunag.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}
