import Link from "next/link";
import EmployeeAccess from "./EmployeeAccess";

const products = [
  { name: "Underline Heavyweight Tee", price: "$28", tag: "Core collection", tone: "linear-gradient(135deg,#222,#716047)" },
  { name: "ShadowCore Hoodie", price: "$68", tag: "ShadowCore", tone: "linear-gradient(135deg,#111,#39404b)" },
  { name: "Underline Cap", price: "$24", tag: "Core collection", tone: "linear-gradient(135deg,#30291e,#b48b4f)" },
];

export default function Home() {
  return <main className="shell"><div className="container">
    <header className="topbar"><div className="brand">UNDERLINE</div><nav className="muted" style={{display:"flex",gap:20,fontSize:14}}><Link href="#orders">My orders</Link><Link href="#profile">JD · Engineering</Link></nav></header>
    <section style={{padding:"72px 0 48px",display:"flex",justifyContent:"space-between",gap:32,alignItems:"end",flexWrap:"wrap"}}>
      <div><div className="eyebrow">Employee store · 2026</div><h1 style={{fontSize:"clamp(42px,7vw,76px)",lineHeight:.98,maxWidth:720,margin:"16px 0"}}>Merch for the people building what’s next.</h1><p className="muted" style={{maxWidth:520,fontSize:17,lineHeight:1.6}}>A private Underline collection for the teams behind ShadowCore, PitStop, and the work in between.</p></div>
      <EmployeeAccess />
    </section>
    <section style={{paddingBottom:72}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",marginBottom:18}}><div><div className="eyebrow">Available now</div><h2 style={{fontSize:30,margin:"8px 0 0"}}>The current drop</h2></div><Link className="button secondary" href="/store">View all</Link></div><div className="grid product-grid">{products.map((product)=><article className="card" key={product.name} style={{overflow:"hidden"}}><Link href="/store" aria-label={`Shop ${product.name}`} style={{display:"block",color:"inherit",textDecoration:"none"}}><div style={{height:230,background:product.tone,display:"grid",placeItems:"center",fontSize:40,fontWeight:800,letterSpacing:".08em"}}>U</div><div style={{padding:18}}><div className="eyebrow">{product.tag}</div><h3 style={{margin:"9px 0 6px",fontSize:18}}>{product.name}</h3><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="muted">{product.price}</span><span style={{color:"var(--gold)",fontSize:13,fontWeight:700}}>Shop →</span></div></div></Link></article>)}</div></section>
    <footer style={{borderTop:"1px solid var(--line)",padding:"20px 0 32px",fontSize:12}} className="muted">Internal use only · Powered by Fourthwall · Allowance preview</footer>
  </div></main>;
}
