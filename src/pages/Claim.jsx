import React, { useState, useEffect } from "react"
import html2pdf from "html2pdf.js"
import renderTemplate from "../utils/template"

export default function Claim(){
  const [data,setData] = useState([])
  const [eventCode,setEventCode] = useState("")
  const [email,setEmail] = useState("")
  const [phone,setPhone] = useState("")
  const [results,setResults] = useState(null)
  const [error,setError] = useState("")

  useEffect(()=>{ fetch("/data/participants.json").then(r=>r.ok? r.json(): Promise.reject()).then(j=>setData(j)).catch(()=>setData([])) },[])

  function search(){
    setError(""); setResults(null)
    const ec = eventCode.trim()
    const em = email.trim().toLowerCase()
    const ph = phone.trim()
    const found = data.filter(d=> (d.eventCode||"") === ec && (d.email||"").toLowerCase() === em && (d.phone||"") === ph)
    setResults(found)
  }

  function download(item){
    if(!item.present) return
    const node = renderTemplate(item)
    html2pdf().from(node).set({margin:10,filename:`${(item.name||"cert").replace(/\s+/g,"_")}.pdf`,html2canvas:{scale:2}}).save()
  }

  return (
    <div className="container">
      <h1>Claim</h1>
      <div className="small">Enter event code, email and phone</div>
      <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        <input placeholder="eventCode" value={eventCode} onChange={e=>setEventCode(e.target.value)}/>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input placeholder="phone" value={phone} onChange={e=>setPhone(e.target.value)}/>
      </div>
      <div style={{marginTop:12}}><button onClick={search}>Get Certificates</button></div>
      <div style={{marginTop:12}}>
        {results && results.length===0 && <div className="small">No matches</div>}
        {results && results.map(r=>(
          <div key={r.id} className="preview" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontWeight:700}}>{r.name}</div>
              <div className="small">{r.eventCode} • {r.email} • {r.phone}</div>
              {!r.present && <div style={{color:'#b00',marginTop:6,fontWeight:600}}>You didn't turn up!</div>}
            </div>
            <div>
              <button onClick={()=>download(r)} disabled={!r.present}>Download</button>
            </div>
          </div>
        ))}
        {results===null && <div className="small">If data is missing, ask admin to place participants.json at /data/participants.json</div>}
      </div>
    </div>
  )
}
