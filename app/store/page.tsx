import Link from "next/link";
import { getProducts } from "@/lib/fourthwall";
import StoreClient from "./StoreClient";

export default async function StorePage() {
  let live: Awaited<ReturnType<typeof getProducts>> | null = null;
  let error = false;
  try { if (process.env.FOURTHWALL_STOREFRONT_TOKEN) live = await getProducts(); } catch { error = true; }
  return <main className="shell"><div className="container"><header className="topbar"><Link className="brand" href="/">UNDERLINE</Link><Link className="button secondary" href="/">Dashboard</Link></header><section style={{padding:"54px 0"}}><div className="eyebrow">Employee store</div><h1 style={{fontSize:48,margin:"12px 0 8px"}}>Shop the collection</h1><p className="muted">Products are loaded from your Fourthwall collections. Your cart is locked to your remaining allowance.</p>{!live && <div className="card" style={{padding:20,marginTop:28}}><strong>{error ? "Fourthwall is unavailable." : "Fourthwall is not configured yet."}</strong><p className="muted" style={{marginBottom:0}}>Add the Storefront token to `.env.local` to load live products. The dashboard shell is ready for local development.</p></div>}{live && <div style={{marginTop:28}}><StoreClient products={live.results} /></div>}</section></div></main>;
}
