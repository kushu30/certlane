import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Admin from "./pages/Admin"
import Claim from "./pages/Claim"
export default function App(){ return (
  <BrowserRouter>
    <nav style={{display:"flex",gap:"1rem",padding:"1rem",borderBottom:"1px solid #ddd"}}>
      <Link to="/admin">Admin</Link><Link to="/claim">Claim</Link>
    </nav>
    <Routes>
      <Route path="/admin" element={<Admin/>}/>
      <Route path="/claim" element={<Claim/>}/>
      <Route path="*" element={<Claim/>}/>
    </Routes>
  </BrowserRouter>
)}
