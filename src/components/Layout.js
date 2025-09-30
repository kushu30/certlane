import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <>
      <nav style={{display:"flex",gap:"1rem",padding:"1rem",borderBottom:"1px solid #ddd"}}>
        <Link href="/claim">Claim Certificate</Link>
        <Link href="/login">Client Login</Link>
        <Link href="/register">Client Register</Link>
        <Link href="/superadmin/login">Super Admin</Link>
      </nav>
      <main>{children}</main>
    </>
  );
}