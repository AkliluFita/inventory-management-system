"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Minus, Package, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { money, today, validDate, type CartLine, type Sale } from "@primestock/domain";
import { useWorkspace } from "@/components/workspace-provider";
import { mutations } from "@/lib/api";
import { Empty, FormField, PageHeader, Panel, SearchField } from "@/components/ui";

export function SalesScreen() {
  const { workspace, branchId, run, busy, t }=useWorkspace();
  const [query,setQuery]=useState("");
  const [cartState,setCartState]=useState<{branchId:string;lines:CartLine[]}>({branchId:"",lines:[]});
  const [method,setMethod]=useState<Sale["method"]>("Full payment");
  const [customer,setCustomer]=useState("");
  const [paid,setPaid]=useState("");
  const [date,setDate]=useState(today());
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const data=workspace!.inventory;
  const cart=cartState.branchId===branchId?cartState.lines:[];
  const available=useMemo(()=>data.products.filter(p=>`${p.name} ${p.sku} ${p.brand} ${p.category}`.toLowerCase().includes(query.toLowerCase())),[data.products,query]);
  const total=cart.reduce((sum,line)=>sum+(data.products.find(p=>p.id===line.productId)?.price||0)*line.quantity,0);
  function change(productId:string,delta:number) {
    const product=data.products.find(p=>p.id===productId);
    if (!product || product.stock<=0) return;
    const current=cart.find(line=>line.productId===productId)?.quantity||0;
    const next=Math.max(0,Math.min(product.stock,current+delta));
    const lines=cart.filter(line=>line.productId!==productId);
    if(next>0) lines.push({productId,quantity:next});
    setCartState({branchId,lines}); setError(""); setNotice("");
  }
  async function checkout() {
    setError("");setNotice("");
    try {
      if (!cart.length) throw new Error("Add a product to the cart first.");
      if (!validDate(date)) throw new Error("Choose a valid sale date.");
      for(const line of cart){const p=data.products.find(p=>p.id===line.productId);if(!p||line.quantity>p.stock)throw new Error(`${p?.name||"A product"} has insufficient stock.`);}
      const amount=paid.trim()===""?NaN:Number(paid.replace(/,/g,""));
      if(method==="Partial credit" && (!customer.trim()||!Number.isFinite(amount)||amount<=0||amount>=total))throw new Error("Enter a customer and a payment smaller than the sale total.");
      if(method==="Overpayment" && (!Number.isFinite(amount)||amount<=total))throw new Error("Amount received must be greater than the sale total.");
      const receipt=await run((c,id)=>mutations.completeSale(c,id,cart,method,customer.trim(),method==="Full payment"?null:amount,date));
      setCartState({branchId,lines:[]}); setCustomer("");setPaid("");setMethod("Full payment");setNotice(`Sale ${receipt.id.slice(0,8).toUpperCase()} completed successfully.`);
    }catch(cause){setError(cause instanceof Error?cause.message:"Could not complete the sale.");}
  }
  return <><PageHeader eyebrow="POINT OF SALE" title="Sales" description="Add products, review the cart, and complete the sale in one place."/>
    {notice&&<div className="notice blue" role="status"><CheckCircle2 size={18}/>{notice}</div>}{error&&<div className="notice red" role="alert">{error}</div>}
    <div className="split-panels"><Panel title="Choose products" hint={`${data.products.length} products in this branch`}><div className="toolbar"><SearchField value={query} onChange={setQuery} placeholder="Search product, SKU or brand..."/></div>{available.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>{t('Product')}</th><th className="number">Available</th><th className="number">Price</th><th className="actions-cell">Add</th></tr></thead><tbody>{available.map(p=><tr key={p.id}><td><div className="product-cell"><span className="product-icon"><Package size={17}/></span><div><strong>{p.name}</strong><small>{p.sku} · {p.unit}</small></div></div></td><td className="number">{p.stock}</td><td className="number"><strong>{money(p.price)}</strong></td><td className="actions-cell"><button className="button small subtle" disabled={p.stock===0||cart.find(l=>l.productId===p.id)?.quantity===p.stock} onClick={()=>change(p.id,1)}><Plus size={14}/> {t("Add")}</button></td></tr>)}</tbody></table></div>:<Empty icon={query?Search:Package} title={query?"No matching products":"No products available"} description={query?"Try another search term.":"Add products and receive stock before making a sale."}/>}</Panel>
      <Panel title={`Current cart (${cart.reduce((sum,l)=>sum+l.quantity,0)} items)`} hint="Review your sale before checkout" className="cart-panel">{cart.length?<>{cart.map(line=>{const product=data.products.find(p=>p.id===line.productId);if(!product)return null;return <div className="cart-line" key={line.productId}><div><strong>{product.name}</strong><small>{money(product.price)} each</small></div><div className="qty-stepper"><button aria-label={`Remove one ${product.name}`} onClick={()=>change(product.id,-1)}><Minus size={13}/></button><span>{line.quantity}</span><button aria-label={`Add one ${product.name}`} disabled={line.quantity>=product.stock} onClick={()=>change(product.id,1)}><Plus size={13}/></button></div><span className="line-total">{money(product.price*line.quantity)}</span></div>})}<div className="cart-totals"><span>{t("Sale total")}</span><strong>{money(total)}</strong></div><div className="payment-options">{(["Full payment","Partial credit","Overpayment"] as const).map(option=><button key={option} className={method===option?"active":""} onClick={()=>{setMethod(option);setError("");}}>{t(option)}</button>)}</div><div className="form-grid"><FormField label="Sale date"><input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></FormField>{method!=="Full payment"&&<FormField label="Amount received (ETB)"><input type="number" min="0" step="0.01" value={paid} onChange={e=>setPaid(e.target.value)} placeholder="0.00"/></FormField>}{method==="Partial credit"&&<div className="full"><FormField label="Customer name"><input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Customer name" required/></FormField></div>}</div>{method==="Partial credit"&&Number(paid)>0&&<p className="payment-hint">Balance due: <strong>{money(Math.max(0,total-Number(paid)))}</strong></p>}{method==="Overpayment"&&Number(paid)>total&&<p className="payment-hint">Change due: <strong>{money(Number(paid)-total)}</strong></p>}<button className="button primary checkout-button" disabled={busy} onClick={()=>void checkout()}><ShoppingCart size={17}/> {busy?"Completing...":t("Complete sale")}</button><button className="clear-cart" onClick={()=>setCartState({branchId,lines:[]})}><Trash2 size={14}/> {t("Clear cart")}</button></>:<Empty icon={ShoppingCart} title="Your cart is empty" description="Add a product from the catalog to begin a sale."/>}</Panel></div>
  </>;
}
