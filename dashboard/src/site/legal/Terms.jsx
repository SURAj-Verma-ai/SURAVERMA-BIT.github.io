import { Clause, DocTable } from "./prose.jsx";
import LegalLayout from "./LegalLayout.jsx";
import { company, site } from "../content.js";
import { betaLaunchAvailability, consumerPlanRows, refundRows } from "./policies.js";
import { productAgeEligibility, ageControlsReleaseStatus, ageTransitionLimits } from "../agePolicy.js";

// Terms reflect the operator information and billing policy confirmed by the founder.

const rail = [
  {
    title: "Terms",
    items: [
      { href: "#t1", label: "1 · The agreement" },
      { href: "#t2", label: "2 · Licence" },
      { href: "#t3", label: "3 · Subscriptions" },
      { href: "#t4", label: "4 · Acceptable use" },
      { href: "#t5", label: "5 · AI responses" },
      { href: "#t6", label: "6 · Your files" },
      { href: "#t7", label: "7 · Availability" },
      { href: "#t8", label: "8 · Liability" },
      { href: "#t9", label: "9 · Ending it" },
      { href: "#t10", label: "10 · Law & disputes" },
    ],
  },
];

export default function Terms() {
  return (
    <LegalLayout slug="terms" rail={rail}>
      <Clause n="1" id="t1" title="The agreement">
        <p>These terms apply to {site.name} ({site.shortName}), provided under the {company.name} brand. Installing or using XOS1 means you accept them. If you do not, do not install it.</p>
        <p>{betaLaunchAvailability} The <a href="/legal/beta-terms">Beta Terms</a> explain what to expect during this release stage and apply alongside these terms.</p>
        <p>{company.identity} For questions about these terms, contact <a href={`mailto:${site.contact.legal}`}>{site.contact.legal}</a>.</p>
        <p>{productAgeEligibility} If you cannot legally enter this agreement yourself, a parent or legal guardian must accept it on your behalf where required. Use remains subject to applicable law, including sanctions and export restrictions.</p>
        <p>The <a href="/legal/minors-policy">Minors Policy</a> describes the intended experiences for users under 13, users aged 13–17 and adults. {ageControlsReleaseStatus}</p>
        <p>Accepting this agreement does not replace any separate consent required for a child’s personal information. The <a href="/legal/privacy">Privacy Policy</a> explains guardian requests, optional parental visibility and data handling.</p>
        <p>{ageTransitionLimits}</p>
      </Clause>

      <Clause n="2" id="t2" title="What you may do with it">
        <p>We grant you a personal, non-exclusive, non-transferable, revocable licence to install and use XOS1 on devices you own or control, for your own use, for as long as your subscription is active.</p>
        <p>You may not copy, resell, sublicense or redistribute it; reverse-engineer, decompile or extract the models, prompts or configuration it ships with; remove attribution; or use it to build a competing product. The software, its models and its prompts remain ours.</p>
      </Clause>

      <Clause n="3" id="t3" title="Subscriptions, billing and cancellation">
        <p>The planned launch subscriptions are for individual customers. Monthly US-dollar prices, before applicable taxes, are:</p>
        <DocTable head={["Plan", "Monthly price (USD)"]} rows={consumerPlanRows} />
        <p>Enterprise subscriptions and team plans are planned separately and are not included in the initial offering.</p>
        <p>XOS1 is sold on a subscription. Prices are offered in US dollars (USD) and Indian rupees (INR), as shown at checkout. Your plan, billing period, applicable taxes and total charge are displayed before you pay.</p>
        <p>A purchase must be authorised by a person entitled to enter the billing agreement and use the payment method. Where a guardian purchases access for a child, payment does not by itself authorise access to the child’s conversations or optional data processing. Turning 18 does not automatically create a new subscription, change its price or authorise a new charge.</p>
        <ul>
          <li><strong>It renews automatically</strong> at the end of each period at the then-current price, until you cancel.</li>
          <li><strong>You can cancel any time</strong> from Settings. Cancelling stops the next renewal. Your access continues until the end of the paid period, unless a different remedy is required by law.</li>
          <li><strong>We will remind you</strong> before an annual renewal, and before any price increase, with enough notice to cancel first.</li>
          <li><strong>Refunds:</strong> subscription payments are not refundable for a change of mind or voluntary cancellation, except where applicable law gives you a refund or cancellation right. We refund verified duplicate or erroneous charges, regardless of the number of charges. If a failed payment attempt results in a settled charge without the corresponding subscription, we will correct the payment or refund it after verification.</li>
          <li><strong>If payment fails</strong> we may suspend access until it is resolved. Your local data stays on your machine.</li>
        </ul>
      </Clause>

      <Clause n="4" id="t4" title="Prohibited uses">
        <p>Do not use XOS1 to break the law; to harass, defraud or impersonate anyone; to generate content that sexualises children or incites violence; to attack systems or bypass security; to process other people’s personal data without a lawful basis; or to provide material you have no right to share.</p>
        <p>XOS1 recognises voices and faces. <strong>Do not enrol another person without telling them and getting their agreement</strong>. In several jurisdictions doing so is itself unlawful, and it is your responsibility, not ours.</p>
        <p>Do not bypass age safeguards, misrepresent age or guardian authority, or use XOS1 for covert or unauthorised monitoring. The adult configuration remains subject to these terms, lawful-use rules and the permissions granted on the device.</p>
      </Clause>

      <Clause n="5" id="t5" title="AI responses are not professional advice">
        <p>XOS1 uses AI. It can produce incorrect answers, misread what you said, and provide information that is out of date or fabricated. Check anything that matters.</p>
        <p><strong>XOS1 is not a financial adviser.</strong> Prices, portfolio valuations, market news and any observations about your holdings are for information only, come from third-party sources we do not control, may be delayed or wrong, and are <strong>not investment advice, a recommendation, or an offer to deal.</strong> Investment decisions are yours alone and we are not liable for them.</p>
        <p>XOS1 is likewise not a lawyer, a doctor, a therapist or an accountant, and its responses are not professional advice in any of those fields. If you are in crisis, contact a qualified professional or your local emergency service.</p>
      </Clause>

      <Clause n="6" id="t6" title="Your files and XOS1’s access">
        <p>XOS1 has its own workspace folder on your disk that it can read and write. It can also <strong>browse and read</strong> the rest of your computer, and by default it cannot write to or delete anything outside its workspace. If you switch on full-device access, you take responsibility for what follows.</p>
        <p>XOS1 asks before anything destructive. It can still make mistakes. <strong>Keep backups of anything you cannot afford to lose.</strong> You are responsible for having the right to let XOS1 read the files you point it at.</p>
      </Clause>

      <Clause n="7" id="t7" title="Availability and things outside our control">
        <p>XOS1 depends on third-party AI providers and data sources. When they are down, rate-limited, or have changed their terms, some features may stop working, and we do not promise uninterrupted service.</p>
        <p>We may change, suspend or discontinue features, and we may update the software automatically to fix security problems.</p>
        <p>If we discontinue a paid service before the end of your paid subscription period, we refund the payment for that affected period according to how much of the period has elapsed. Every billing period is divided into four equal parts:</p>
        <DocTable head={["Time elapsed in the paid period", "Refund"]} rows={refundRows} />
        <p>The calculation uses time elapsed from the start of the billing period to the date the service ends, not how frequently you used it. The same proportions apply to every billing period. This is separate from voluntary cancellation, and does not limit any greater refund or other remedy required by applicable law.</p>
      </Clause>

      <Clause n="8" id="t8" title="Warranties and liability">
        <p>Except where the law says otherwise, XOS1 is provided “as is”, without warranty of any kind, and we do not warrant that it will be accurate, uninterrupted or fit for a particular purpose.</p>
        <p>To the fullest extent the law permits, we are not liable for indirect, incidental, special or consequential loss, lost profits, lost data, or losses from decisions made in reliance on XOS1’s responses. Our total liability for any claim is capped at <strong>the amount you paid us in the twelve months before it arose</strong>.</p>
        <p>Nothing here excludes liability that cannot lawfully be excluded, including death or personal injury caused by negligence, fraud, or your non-waivable statutory rights as a consumer.</p>
      </Clause>

      <Clause n="9" id="t9" title="Ending it">
        <p>You can stop at any time: cancel, and uninstall. Local records remain on your machine until removed. Factory reset clears records within its reset scope; it is not secure disk erasure and does not remove exports, external backups or company-held information. See <a href="/legal/data-deletion">Data Deletion</a> for the separate steps.</p>
        <p>We may suspend or end your access if you materially breach these terms, and we will tell you why unless the law prevents us. The sections on liability, intellectual property and governing law survive.</p>
      </Clause>

      <Clause n="10" id="t10" title="Governing law and disputes">
        <p>These terms are governed by the laws of India. Subject to mandatory law, disputes are handled by the competent courts with jurisdiction over Noida, Uttar Pradesh, India. Consumers retain any right to bring proceedings in their country of residence and any protections that applicable law does not allow them to waive.</p>
        <p>Complaints can be raised with our {company.grievance.designation}, {company.grievance.name}, at <a href={`mailto:${company.grievance.email}`}>{company.grievance.email}</a>. Complaints are acknowledged within 48 hours and resolved within one month.</p>
        <p>You may contact <a href={`mailto:${site.contact.legal}`}>{site.contact.legal}</a> to discuss a dispute. Contacting us first is not a condition of exercising your legal rights.</p>
      </Clause>
    </LegalLayout>
  );
}
