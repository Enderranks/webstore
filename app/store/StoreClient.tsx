"use client";

import { useEffect, useMemo, useState } from "react";
import type { FourthwallProduct } from "@/lib/fourthwall";
import { readEmployeeSession, type EmployeeSession } from "../EmployeeAccess";

export default function StoreClient({ products }: { products: FourthwallProduct[] }) {
  const [cart, setCart] = useState<Array<{ product: FourthwallProduct; priceCents: number }>>([]);
  const [session, setSession] = useState<EmployeeSession | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => setSession(readEmployeeSession()), []);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.priceCents, 0), [cart]);
  const remaining = (session?.remainingCents ?? 0) - total;

  function add(product: FourthwallProduct) {
    if (!session) {
      setMessage("Verify your employee ID and company email on the dashboard first.");
      return;
    }
    const priceCents = Math.round((product.variants?.[0]?.unitPrice?.value || 0) * 100);
    if (total + priceCents > (session?.remainingCents ?? 0)) {
      setMessage("That item would exceed your remaining allowance.");
      return;
    }
    setCart([...cart, { product, priceCents }]);
    setMessage("");
  }

  return <>
    {message && <div className="card" role="alert" style={{ padding: 16, margin: "24px 0", borderColor: "rgba(216,178,110,.6)", color: "var(--gold)" }}>{message}</div>}
    <div className="card" style={{ padding: 18, margin: "24px 0", display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
      <span>Cart total: <strong>${(total / 100).toFixed(2)}</strong></span>
      <span className="muted">Remaining: <strong style={{ color: remaining >= 0 ? "var(--paper)" : "#ef9b83" }}>${Math.max(0, remaining / 100).toFixed(2)}</strong></span>
    </div>
    <div className="grid product-grid">{products.map((product) => {
      const price = product.variants?.[0]?.unitPrice?.value || 0;
      return <article className="card" key={product.id} style={{ padding: 20 }}><div className="eyebrow">Fourthwall product</div><h2 style={{ fontSize: 20 }}>{product.name}</h2><p className="muted">{product.description || "Employee collection item"}</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><span>${price.toFixed(2)}</span><button className="button" onClick={() => add(product)}>Add to cart</button></div></article>;
    })}</div>
  </>;
}
