import React, { useState, useRef } from "react";
import renderTemplate from "../utils/template";
import { verify } from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;
const cookieName = 'AuthToken';
const absoluteUrl = process.env.NEXT_PUBLIC_ABSOLUTE_URL || 'http://localhost:3000';

export async function getServerSideProps(context) {
  const { req } = context;
  const token = req.cookies[cookieName];

  if (!token) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  try {
    const decoded = verify(token, jwtSecret);
    
    const response = await fetch(`${absoluteUrl}/api/participants/list`, {
      headers: { 'Cookie': `${cookieName}=${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch participants');

    const initialParticipants = await response.json();
    
    return { props: { userEmail: decoded.email, initialParticipants } };

  } catch (error) {
    return { redirect: { destination: '/login', permanent: false } };
  }
}

export default function AdminPage({ userEmail, initialParticipants }) {
  const [rows, setRows] = useState(initialParticipants);
  const [selected, setSelected] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef();

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    
    import('papaparse').then(Papa => {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: r => {
          const data = r.data.map((row, i) => ({
            id: i + 1,
            name: (row.name || row.Name || "").trim(),
            email: (row.email || row.Email || "").trim().toLowerCase(),
            phone: (row.phone || row.Phone || "").trim(),
            eventCode: (row.eventCode || row.EventCode || "").trim(),
            eventName: (row.eventName || row.EventName || "").trim(),
            subEventName: (row.subEventName || row.SubEventName || "").trim(),
            present: true,
            meta: row
          }));
          setRows(data);
          setUploadStatus('CSV parsed. Click "Upload to DB" to save.');
        }
      });
    });
  }

  async function uploadToDB() {
    if (rows.length === 0) {
      setUploadStatus("No data to upload.");
      return;
    }
    setIsUploading(true);
    setUploadStatus("Uploading...");

    try {
      const response = await fetch('/api/participants/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setUploadStatus(`Success! ${result.insertedCount} records uploaded.`);
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }

  function editCell(i, field, val) {
    const copy = [...rows];
    copy[i] = { ...copy[i], [field]: val };
    setRows(copy);
  }

  function togglePresent(i) {
    const copy = [...rows];
    copy[i] = { ...copy[i], present: !copy[i].present };
    setRows(copy);
  }

  function preview(i) {
    setSelected(rows[i]);
  }

  // MODIFIED: This function is no longer async
  function downloadPdf(i) {
    if (!rows[i].present) return;
    
    import('html2pdf.js').then(({ default: html2pdf }) => {
      const node = renderTemplate(rows[i]);

      const options = {
        margin: 0,
        filename: `${(rows[i].name || "cert").replace(/\s+/g, "_")}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape', width: 297, height: 210 }
      };

      html2pdf().from(node).set(options).save();
    });
  }

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <p className="small">Welcome, {userEmail}</p>

      <div className="row" style={{ gap: 8, marginTop: '20px' }}>
        <input ref={fileRef} type="file" accept=".csv" onChange={onFile} />
        <button onClick={uploadToDB} disabled={isUploading || rows.length === 0}>
          {isUploading ? "Uploading..." : "Upload to DB"}
        </button>
      </div>
      {uploadStatus && <div className="small" style={{marginTop: '8px'}}>{uploadStatus}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Event Name</th>
            <th>Sub-event</th>
            <th>Present</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || r._id}>
              <td>{r.id || i + 1}</td>
              <td><input value={r.name} onChange={e => editCell(i, "name", e.target.value)} /></td>
              <td><input value={r.email} onChange={e => editCell(i, "email", e.target.value)} /></td>
              <td><input value={r.eventName} onChange={e => editCell(i, "eventName", e.target.value)} /></td>
              <td><input value={r.subEventName} onChange={e => editCell(i, "subEventName", e.target.value)} /></td>
              <td style={{ textAlign: "center" }}>
                <input type="checkbox" checked={r.present} onChange={() => togglePresent(i)} />
              </td>
              <td>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => preview(i)}>Preview</button>
                  <button onClick={() => downloadPdf(i)} disabled={!r.present}>PDF</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="preview">
        {selected ? <div dangerouslySetInnerHTML={{ __html: renderTemplate(selected).innerHTML }} /> : <div className="small">Select a row to preview</div>}
      </div>
    </div>
  );
}