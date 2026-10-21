// Working copy only. These pages deliberately remain outside published.json.
// Resolve the listed release decisions before exposing them as customer policies.
import { consumerPlanRows } from "./policies.js";
import { consentAndControls } from "../agePolicy.js";

export const draftPolicies = {
  "fair-usage-policy": {
    pending: [
      "Trial payment-card requirement and whether it converts to a paid plan.",
      "Models, features and measured usage allowance for each tier.",
      "Indian-rupee prices.",
      "Trial, device-management and usage-meter enforcement in the customer release.",
    ],
    recommendation: {
      trialDays: 14,
      trialPlan: "Premium",
      activeDevices: 2,
      peoplePerAccount: 1,
      installationsLimited: false,
      allowanceSharedAcrossDevices: true,
    },
    sections: [
      { id: "plans", title: "Individual subscriptions", paragraphs: [
        "XOS1’s launch subscriptions are for individual customers. Premium, Ultra and Max are monthly plans. The prices below are in US dollars, before applicable tax. Your checkout shows the currency, tax and total before you pay.",
      ], table: { head: ["Plan", "Monthly price (USD)"], rows: consumerPlanRows } },
      { id: "trial", title: "Try Premium", paragraphs: [
        "Explore XOS1 with a 14-day Premium trial. The trial terms shown before you start explain eligibility, included usage and what happens when the trial ends.",
      ] },
      { id: "devices", title: "Your account and devices", paragraphs: [
        "Install XOS1 on your compatible devices and keep your account active on up to two at a time. Each subscription is for one person. Usage belongs to the account and is shared across its active devices.",
        "Using a second device does not create a second usage allowance. Enterprise subscriptions and team plans will have separate terms when available.",
      ] },
      { id: "allowance", title: "Included usage", paragraphs: [
        "Your plan details will state the available features, included AI usage and when the allowance resets. These details must be available before you subscribe. We will not describe a plan as unlimited where limits apply.",
        "A request may involve several model calls. The customer-facing allowance must explain how those calls count, rather than treating every internal call as a separate question you asked.",
      ] },
    ],
  },
  "biometrics-policy": {
    pending: [
      "Verify explicit opt-in before any enrolment in the shipping release.",
      "Verify disable, delete and non-biometric alternative controls.",
      "Confirm whether face recognition is available at launch or remains disabled.",
      "Verify biometric storage, deletion scope and handling of backups.",
      "Verify child-specific enrolment, required guardian consent and a non-biometric alternative for each launch jurisdiction.",
    ],
    sections: [
      { id: "choice", title: "Recognition is your choice", paragraphs: [
        "Voice and face recognition are intended to be optional. Before you enrol, XOS1 will explain the feature and ask for your permission separately from general account terms. You should be able to decline recognition and use a non-biometric alternative.",
        "These are launch requirements, not a claim that every control is already present in the development build. Voice transcription and enrolling a voiceprint are separate functions.",
      ] },
      { id: "local", title: "Templates stay on your device", paragraphs: [
        "Recognition uses a local template called a voiceprint or faceprint. The template is not sent to an AI provider. A recognised name or label may be included in a request, but the biometric template used to recognise you remains local.",
        "A template can identify you and is sensitive information. Local processing reduces the need to share it; it does not make an unlocked device or a copied backup immune to access.",
      ] },
      { id: "control", title: "Keep control of recognition", paragraphs: [
        "The intended controls let you turn recognition off, enrol again or delete the stored template. Turning recognition off and deleting a template are separate choices. The interface must explain the difference before you confirm.",
        "Deleting a local template does not erase copies in external backups. Only enrol yourself or another person who has given the required informed permission.",
      ] },
      { id: "children", title: "Children’s recognition choices", paragraphs: [
        consentAndControls,
        "A child-facing release must assess biometric enrolment separately from voice transcription, general terms and parental activity controls. Verify the required notice, permission, withdrawal and deletion controls before enabling recognition. Consent does not permit processing that applicable law prohibits.",
      ] },
    ],
  },
  "third-party-disclosure": {
    pending: [
      "Final production providers, models, processing locations and contracts.",
      "Verify no-training terms and zero-retention controls for every selected feature.",
      "Identify the exact service referred to as Typesafe AI for jev.",
      "Confirm payment, hosting/CDN and analytics providers outside this repository.",
      "Verify each provider’s child-data eligibility, consent requirements and safeguards; map any planned guardian or parental-activity data flow before release.",
    ],
    sections: [
      { id: "processing", title: "Cloud AI processing", paragraphs: [
        "AI requests can include your message and relevant context, such as a memory or text from an open workspace document. XiteAI’s gateway passes that request to the provider configured for your release. Local storage of your conversation history does not mean all AI processing is local.",
      ] },
      { id: "selection", title: "Provider selection", paragraphs: [
        "Cerebras and Groq are being evaluated for the customer release. Neither is represented here as a confirmed production recipient. DeepInfra is used for development testing and is not the selected launch provider.",
        "The final notice must name the providers receiving customer requests, their purpose and the applicable safeguards before cloud features are enabled.",
      ] },
      { id: "privacy", title: "Content and service records", paragraphs: [
        "XiteAI will not use private customer conversations for model training or authorise providers to do so. The intended production requirement is zero retention of prompts and responses, verified for the selected services and account settings.",
        "Content retention is separate from account, billing and operational metadata. A provider can avoid storing prompts while still recording the information needed to operate and bill its service.",
      ] },
      { id: "children", title: "Children’s data and outside services", paragraphs: [
        "All-age product eligibility does not establish that every outside service permits child-data processing. Before sending a child’s information, verify the service’s age eligibility, required consent, processing purpose, contractual safeguards and retention controls. Features must remain unavailable where their required protections are not ready.",
        "Any service used for age verification, guardian consent or parental activity must be identified in the release notice, together with the information it receives. This draft does not name or claim an implemented verification provider.",
      ] },
    ],
  },
};
