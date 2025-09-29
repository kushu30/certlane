import React, { useState, useRef } from "react"
import Papa from "papaparse"
import html2pdf from "html2pdf.js"
import renderTemplate from "../utils/template"

export default function Admin(){
  const [rows,setRows] = useState([])
  const [selected,setSelected] = useState(null)
  const fileRef = useRef()

  function onFile(e){
    const f = e.target.files?.[0]; if(!f) return
    Papa.parse(f,{header:true,skipEmptyLines:true,complete:r=>{
      const data = r.data.map((row,i)=>({
        id:i+1,
        name:(row.name||row.Name||"").trim(),
        email:(row.email||row.Email||"").trim().toLowerCase(),
        phone:(row.phone||row.Phone||"").trim(),
        eventCode:(row.eventCode||row.Event||row.event||"").trim(),
        present: true,
        meta:row
      }))
      setRows(data)
    }})
  }

  function editCell(i,field,val){
    const copy = [...rows]; copy[i] = {...copy[i],[field]:val}; setRows(copy)
  }

  function togglePresent(i){
    const copy = [...rows]; copy[i] = {...copy[i],present:!copy[i].present}; setRows(copy)
  }

  function preview(i){ setSelected(rows[i]) }

  function downloadPdf(i){
    if(!rows[i].present) return
    const node = renderTemplate(rows[i])
    html2pdf().from(node).set({margin:10,filename:`${(rows[i].name||"cert").replace(/\s+/g,"_")}.pdf`,html2canvas:{scale:2}}).save()
  }

  function exportJson(){
    const blob = new Blob([JSON.stringify(rows,null,2)],{type:"application/json"})
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="participants.json"; a.click()
  }

  return (
    <div className="container">
      <h1>Admin</h1>
      <div className="row" style={{gap:8}}>
        <input ref={fileRef} type="file" accept=".csv" onChange={onFile}/>
        <button onClick={exportJson}>Export JSON</button>
      </div>
      <table className="table">
        <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Event</th><th>Present</th><th></th></tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={r.id}>
              <td>{r.id}</td>
              <td><input value={r.name} onChange={e=>editCell(i,"name",e.target.value)}/></td>
              <td><input value={r.email} onChange={e=>editCell(i,"email",e.target.value)}/></td>
              <td><input value={r.phone} onChange={e=>editCell(i,"phone",e.target.value)}/></td>
              <td><input value={r.eventCode} onChange={e=>editCell(i,"eventCode",e.target.value)}/></td>
              <td style={{textAlign:"center"}}><input type="checkbox" checked={r.present} onChange={()=>togglePresent(i)}/></td>
              <td>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>preview(i)}>Preview</button>
                  <button onClick={()=>downloadPdf(i)}>PDF</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="preview">
        {selected ? <div dangerouslySetInnerHTML={{__html:renderTemplate(selected).innerHTML}}/> : <div className="small">Select a row to preview</div>}
      </div>
    </div>
  )
}
