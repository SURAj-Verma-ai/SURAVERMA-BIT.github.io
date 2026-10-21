import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { annualDiscount } from "./planCatalog.js";
import { createPriceMotion } from "./priceMotion.js";
import "./BillingControls.css";

export function useBillingOptions() {
  const [params,setParams] = useSearchParams();
  const billing = params.get("billing") === "yearly" ? "yearly" : "monthly";
  const currency = params.get("currency") === "INR" ? "INR" : "USD";
  const change = (key,value) => setParams(previous => { const next = new URLSearchParams(previous); next.set(key,value); return next; },{replace:true,preventScrollReset:true});
  return {billing,currency,setBilling:value=>change("billing",value),setCurrency:value=>change("currency",value),query:`?billing=${billing}&currency=${currency}`};
}
export default function BillingControls({options}) {
  return <div className="billing-controls">
    <div className="billing-period" role="group" aria-label="Billing period" data-yearly={options.billing === "yearly"}><span className="billing-selection" aria-hidden="true" />{["monthly","yearly"].map(period => <button key={period} type="button" aria-pressed={options.billing === period} onClick={()=>options.setBilling(period)}><span>{period === "monthly" ? "Monthly" : "Yearly"}</span>{period === "yearly" && <span className="billing-saving">Save {annualDiscount}%</span>}</button>)}</div>
    <div className="billing-currency" role="group" aria-label="Billing currency">{["USD","INR"].map(currency => <button key={currency} type="button" aria-pressed={options.currency === currency} onClick={()=>options.setCurrency(currency)}>{currency}</button>)}</div>
  </div>;
}
export function BillingPrice({quote,className=""}) {
  const digits = useRef(null);
  const period = useRef(null);
  const motion = useRef(null);
  const current = useRef(quote.amount);
  const initialDigits = useRef(quote.digits);
  useEffect(() => {
    const element = digits.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.current ??= createPriceMotion(element, period.current);
    const finish = () => motion.current.settle();
    const bounds = element.getBoundingClientRect();
    const visible = bounds.height > 0 && bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
    motion.current.change(quote.digits, current.current !== quote.amount && !media.matches && !document.hidden && visible, quote.amount >= current.current ? 1 : -1);
    current.current = quote.amount;
    const hidden = () => { if (document.hidden) finish(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) finish(); });
    observer.observe(element);
    document.addEventListener("visibilitychange",hidden);
    const reduced = () => { if (media.matches) finish(); };
    media.addEventListener("change",reduced);
    return () => { motion.current.stop(); observer.disconnect(); document.removeEventListener("visibilitychange",hidden); media.removeEventListener("change",reduced); };
  },[quote.amount,quote.currency,quote.digits]);
  return <div className={`billing-price ${className}`} data-currency={quote.currency}>
    <div className="billing-price-row" aria-hidden="true"><span className="billing-price-number"><span className="billing-symbol">{quote.symbol}</span><span className="billing-price-digits" ref={digits}>{initialDigits.current}</span></span><span className="billing-price-period" ref={period}>/ month</span></div>
    <span className="sr-only" aria-live="polite" aria-atomic="true">{quote.formatted} per month. {quote.billing === "yearly" ? `${quote.totalFormatted} billed yearly.` : "Billed monthly."}</span>
    <p className="billing-price-note" data-yearly={quote.billing === "yearly"}>{quote.billing === "yearly" ? <><strong>{quote.totalFormatted}</strong><span>billed yearly</span></> : "Billed monthly"}</p>
  </div>;
}
