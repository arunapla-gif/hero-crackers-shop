export const metadata = {
  title: 'Safety Guidelines & Green Crackers | Hero Crackers Sivakasi',
  description: 'Essential fireworks safety precautions, dos and don’ts, and CSIR-NEERI green cracker environmental standards.',
};

export default function SafetyPage() {
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
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#B8860B', fontWeight: 'bold' }}>Safety First</span>
          <h1 style={{ color: '#800000', fontSize: '2.4rem', margin: '8px 0 0 0', fontFamily: 'var(--font-serif, serif)' }}>Fireworks Safety Guidelines</h1>
          <p style={{ color: '#777', fontSize: '0.9rem', marginTop: '6px' }}>Safe, Responsible & Vibrant Celebrations</p>
        </div>

        <div style={{ lineHeight: '1.8', color: '#333', fontSize: '1rem' }}>
          {/* Green Crackers Badge */}
          <div style={{ backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '12px', padding: '20px', marginBottom: '30px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
            <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>🌱</span>
            <div>
              <h3 style={{ color: '#2e7d32', margin: '0 0 8px 0', fontSize: '1.2rem' }}>100% CSIR-NEERI Certified Green Crackers</h3>
              <p style={{ margin: 0, color: '#1b5e20', fontSize: '0.95rem' }}>
                All fireworks supplied by Hero Crackers comply with Supreme Court guidelines and CSIR-NEERI formulas. They produce 30% to 35% less particulate matter (PM), contain zero banned chemicals (like Barium Nitrate, Lead, or Antimony), and feature authorized QR codes for authenticity verification.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '35px' }}>
            {/* DO's */}
            <div style={{ backgroundColor: '#f1f8e9', borderLeft: '5px solid #4caf50', borderRadius: '10px', padding: '20px' }}>
              <h3 style={{ color: '#2e7d32', marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span> The "DO's"
              </h3>
              <ul style={{ paddingLeft: '20px', margin: 0, color: '#33691e', fontSize: '0.95rem', lineHeight: '1.7' }}>
                <li><strong>Always buy from authorized PESO dealers</strong> like Hero Crackers.</li>
                <li><strong>Burst in open grounds</strong> away from electrical wiring, trees, vehicles, and flammable structures.</li>
                <li><strong>Keep two buckets ready:</strong> one with clean water and one with dry sand.</li>
                <li><strong>Wear natural cotton clothes</strong> with comfortable footwear while bursting crackers.</li>
                <li><strong>Light with extended sticks:</strong> Use long agarbattis (incense sticks) or sparklers to ignite from arm's length.</li>
                <li><strong>Always supervise children</strong> at all times during celebrations.</li>
              </ul>
            </div>

            {/* DONT's */}
            <div style={{ backgroundColor: '#ffebee', borderLeft: '5px solid #f44336', borderRadius: '10px', padding: '20px' }}>
              <h3 style={{ color: '#c62828', marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>❌</span> The "DON'Ts"
              </h3>
              <ul style={{ paddingLeft: '20px', margin: 0, color: '#b71c1c', fontSize: '0.95rem', lineHeight: '1.7' }}>
                <li><strong>Never ignite crackers inside</strong> homes, balconies, staircases, or closed rooms.</li>
                <li><strong>Never lean directly over</strong> a lit firework or aerial shell.</li>
                <li><strong>Never re-light a dud:</strong> If a cracker fails to burst, wait 15 minutes and douse it thoroughly with water.</li>
                <li><strong>Never carry fireworks in your pockets</strong> or ignite them in containers/bottles.</li>
                <li><strong>Avoid synthetic, loose, or flowy fabrics</strong> like nylon, silk, or chiffon.</li>
                <li><strong>Never throw firecrackers</strong> at passers-by, animals, or passing vehicles.</li>
              </ul>
            </div>
          </div>

          <h3 style={{ color: '#800000', marginTop: '28px', marginBottom: '10px' }}>First Aid Protocol</h3>
          <p style={{ marginBottom: '15px' }}>
            In the event of a minor burn, immediately pour plenty of clean, running room-temperature water over the burn for at least 10 to 15 minutes. <strong>Do not apply ice, butter, grease, or ink.</strong> For burns covering larger areas or face/eye injuries, consult an emergency physician immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
