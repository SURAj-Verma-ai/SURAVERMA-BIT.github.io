import { consumerPlanRows } from "../../site/legal/policies.js";

// Annual/INR pricing and tier entitlements require sign-off in LAUNCH.md.
// Keep every pricing surface on this record. The FX snapshot was supplied
// by the user on 2026-10-13: USD 20 = INR 1,901.41. See LAUNCH.md for refresh.
export const annualDiscount = 20;
export const usdToInrRate = 95.0705;
// Integer cents and a four-decimal FX numerator avoid binary-float half-paise
// errors (USD 350 must round from INR 33,274.675 to INR 33,274.68).
const rupees = dollars => Math.round(Math.round(dollars * 100) * Math.round(usdToInrRate * 10000) / 10000) / 100;
const editions = [
  {id:"premium",intro:"For personal use.",features:["A memory built for a lifetime.","Get things done by asking.","Talk or chat naturally.","A new visual language."],modelAccess:"Standard",usage:"Everyday use",support:"Product support",image:"premium-workspace",alt:"A carefully arranged personal computer workspace",credit:"Matúš Gocman",creditUrl:"https://unsplash.com/photos/a-modern-desk-setup-with-a-computer-and-chair-yLYLIgt2ZyY",description:"Speak or type. Keep your memories and work with your computer."},
  {id:"ultra",intro:"For demanding work.",features:["Everything in Premium","Advanced model access","Expanded usage limits","Priority support"],modelAccess:"Advanced",usage:"Expanded",support:"Priority support",image:"ultra-architecture",alt:"The sweeping curve of a concrete staircase",credit:"Takahiro Nishizono",creditUrl:"https://unsplash.com/photos/curving-concrete-staircase-with-modern-architecture-V9uNLXjc9cI",description:"More model access and more room for the work you do every day."},
  {id:"max",intro:"For extensive daily use.",features:["Everything in Ultra","Full model selection","Highest usage allowances","Priority processing"],modelAccess:"Full selection",usage:"Highest allowance",support:"Priority support",image:"max-landscape",alt:"Mountain ridges and volcanic lakes seen from above",credit:"Spenser Sembrat",creditUrl:"https://unsplash.com/photos/an-aerial-view-of-a-lake-surrounded-by-mountains-ToJ5qbCMLo8",description:"The broadest model access and usage allowance in XOS1."},
];
export const planCatalog = consumerPlanRows.map(([name,price],index) => {
  const monthlyUSD = Number(price.match(/\d+/)[0]);
  const edition = editions[index];
  const annualUSD = Math.round(monthlyUSD*12*(1-annualDiscount/100)*100)/100;
  return {...edition,name,index,price,monthlyUSD,monthlyINR:rupees(monthlyUSD),annualUSD,annualINR:rupees(annualUSD)};
});
export const productFeatures = [
  {id:"voice",name:"Voice and text",short:"Speak or type.",description:"Talk through a task naturally, or use the keyboard when you prefer. Voice recognition and microphone access are separate choices.",to:"/faq#faq-voice-text"},
  {id:"memory",name:"Personal memory",short:"Continue the conversation.",description:"Keep useful details across conversations and bring back the memories relevant to the question. Local storage capacity and recall accuracy have practical limits.",to:"/faq#faq-memory-system"},
  {id:"lumen",name:"Lumen Visuals",short:"See the answer.",description:"Answers can appear visually alongside the conversation. Available visual experiences depend on the product release.",to:"/faq#faq-lumen"},
  {id:"computer",name:"Computer use",short:"Work with your computer.",description:"Work with files, apps and actions through the permissions you grant. Review consequential actions before they are carried out.",to:"/faq#faq-computer-use"},
  {id:"privacy",name:"Privacy and controls",short:"Keep control of your information.",description:"Local history and memory are separate from cloud AI processing. Understand what is sent, manage permissions and use the available record controls.",to:"/legal/privacy"},
  {id:"safety",name:"Age safeguards",short:"An experience suited to your age.",description:"XOS1 is intended for all ages, with age-appropriate boundaries and guardian controls for younger children where enabled.",to:"/legal/minors-policy"},
];
export function planQuote(plan, currency = "USD", billing = "monthly") {
  const region = currency === "INR" ? "INR" : "USD";
  const period = billing === "yearly" ? "yearly" : "monthly";
  const monthly = plan[`monthly${region}`];
  const total = period === "yearly" ? plan[`annual${region}`] : monthly;
  const amount = period === "yearly" ? Math.round(Math.round(total * 100) / 12)/100 : monthly;
  const formatter = new Intl.NumberFormat(region === "INR" ? "en-IN" : "en-US",{maximumFractionDigits:2});
  const symbol = region === "INR" ? "₹" : "$";
  return {currency:region,billing:period,amount,total,symbol,digits:formatter.format(amount),formatted:`${symbol}${formatter.format(amount)}`,totalFormatted:`${symbol}${formatter.format(total)}`,saving:period === "yearly" ? monthly*12-total : 0};
}
export const planMeta = plan => ({title:`XOS1 ${plan.name}: Features & Pricing | XiteAI`,description:`Explore XOS1 ${plan.name}. ${plan.description} Compare monthly and yearly subscriptions in USD or INR.`,path:`/pricing/${plan.id}`});
