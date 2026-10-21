import { consumerPlanRows, betaLaunchAvailability } from "../../site/legal/policies.js";
import { planCatalog } from "./planCatalog.js";

export const pricingPlans = planCatalog.map(plan => ({...plan,amount:String(plan.monthlyUSD)}));
export const pricingOverview = {
  kicker:"XOS1 pricing",
  headline:"Put your computer to work.",
  description:"Talk to XOS1, pick up where you left off, and get help across your computer.",
  planSummaries:{
    premium:"Everyday help across your computer.",
    ultra:"Advanced model access, higher limits and priority support.",
    max:"Full model choice for intensive use.",
  },
};
export const pricingMeta = {
  title:"XOS1 Pricing: Premium, Ultra & Max | XiteAI",
  description:"Compare XOS1 Premium, Ultra and Max. Explore features, monthly and yearly subscriptions, and prices in USD or INR.",
  path:"/pricing",
};
export const pricingAvailability = betaLaunchAvailability;
export const pricingQuestions = [
  {question:"When can I subscribe?",answer:"Subscriptions will open with XOS1’s beta release. A launch date has not been announced. The available features, usage allowances and billing terms will be published before you can subscribe.",to:"/legal/beta-terms",label:"Beta Terms"},
  {question:"What is different between the plans?",answer:"Premium covers personal use. Ultra expands model access and usage limits. Max provides the broadest model selection and highest usage allowance. Open a plan page to explore its features and compare all three.",to:"/pricing/premium",label:"Explore the plans"},
  {question:"Can I see prices in Indian rupees?",answer:"Yes. Use the USD / INR control to change the displayed currency. Prices are shown before applicable taxes. The currency and total charge are shown before payment.",to:"/legal/terms",label:"Terms of Service"},
  {question:"How does yearly billing work?",answer:"Yearly subscriptions are billed once a year. The displayed monthly price is the annual total divided by twelve. Choose Yearly to see the reduced monthly equivalent and the full yearly amount.",to:"/legal/terms",label:"Subscription terms"},
  {question:"How will cancellation and refunds work?",answer:"The subscription terms describe cancellation stopping the next renewal, with access continuing through the paid period. Refund eligibility is covered separately in the Refund Policy. Billing controls will be available with the subscription service.",to:"/legal/refund-policy",label:"Refund Policy"},
];
