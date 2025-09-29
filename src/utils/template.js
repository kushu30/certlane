export default function renderTemplate(data){
  const wrapper = document.createElement("div")
  wrapper.style.width = "1123px"
  wrapper.style.height = "794px"
  wrapper.style.display = "flex"
  wrapper.style.alignItems = "center"
  wrapper.style.justifyContent = "center"
  wrapper.style.fontFamily = "Arial, sans-serif"
  wrapper.innerHTML = `
    <div style="width:900px;height:600px;border:8px solid #111;padding:40px;position:relative;text-align:center;">
      <div style="font-size:20px;font-weight:700">Certificate of Participation</div>
      <div style="margin-top:18px;font-size:14px">This certifies that</div>
      <div style="margin-top:18px;font-size:32px;font-weight:700">${escapeHtml(data.name||"")}</div>
      <div style="margin-top:12px;font-size:14px">${escapeHtml(data.meta?.role||"")}</div>
      <div style="position:absolute;bottom:28px;right:28px;font-size:12px;color:#333">${escapeHtml(data.eventCode||"")}</div>
      <div style="position:absolute;bottom:28px;left:28px;font-size:12px;color:#333">${escapeHtml(data.email||"")}</div>
    </div>`
  return wrapper
}
function escapeHtml(s){ return (s||"").toString().replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }
