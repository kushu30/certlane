import React, { useState } from 'react';
import renderTemplate from '../utils/template';

export default function ClaimPage() {
  const [eventCode, setEventCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSearch(event) {
    event.preventDefault();
    setIsLoading(true);
    setResults(null);
    setMessage('');

    try {
      const query = new URLSearchParams({ eventCode, email, phone });
      const response = await fetch(`/api/participants/claim?${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setResults(data);
      if (data.length === 0) {
        setMessage('No matching certificate found. Please check your details.');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

async function downloadPdf(item) { // Renamed from 'i' to 'item' for clarity
    if (!item.present) return;
    
    const html2pdf = (await import('html2pdf.js')).default;
    const node = renderTemplate(item);

    const options = {
      margin: 0,
      filename: `${(item.name || "cert").replace(/\s+/g, "_")}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false }, // Added logging: false
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape',  
               // IMPORTANT: Set dimensions here to match the template's aspect ratio
               width: 297, // A4 landscape width in mm
               height: 210 // A4 landscape height in mm
             }
    };

    html2pdf().from(node).set(options).save();
  }

  return (
    <div className="container">
      <h1>Claim Your Certificate</h1>
      <p className="small">Enter your event code, email, and phone number to find your certificate.</p>
      
      <form onSubmit={handleSearch}>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, maxWidth: '600px' }}>
          <input placeholder="Event Code" value={eventCode} onChange={e => setEventCode(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Get Certificate"}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 24 }}>
        {message && <div className="small">{message}</div>}
        {results && results.map(r => (
          <div key={r._id} className="preview" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{r.name}</div>
              <div className="small">{r.eventCode} • {r.email} • {r.phone}</div>
              {!r.present && <div style={{ color: '#b00', marginTop: 6, fontWeight: 600 }}>You didn't turn up!</div>}
            </div>
            <div>
              <button onClick={() => downloadPdf(r)} disabled={!r.present}>
                Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}