import { companyPolicy } from "./companyPolicy.js";
import { productAgeEligibility, productAgeBands, ageControlsReleaseStatus, adultTransition, consentAndControls, guardianAccess, ageDataUse, ageTransitionLimits } from "../agePolicy.js";

// Product policies describe confirmed decisions and reviewed behavior. The
// company document shares the Code and published working practices.
export const betaLaunchAvailability = "XOS1 will launch in beta in India and the United States. Other countries are not included in the initial launch.";
export const consumerPlanRows = [
  ["Premium", "$20 per month"],
  ["Ultra", "$60 per month"],
  ["Max", "$350 per month"],
];

export const refundRows = [
  ["Less than 25%", "100% of the payment"],
  ["25% to less than 50%", "75% of the payment"],
  ["50% to less than 75%", "50% of the payment"],
  ["75% to less than 100%", "25% of the payment"],
];

export const policies = {
  "company-policy": companyPolicy,
  "acceptable-use-policy": {
    contact: "legal",
    sections: [
      { id: "scope", title: "Use XOS1 responsibly", paragraphs: [
        "This policy applies to XiteAI Operating System One (XOS1) and related XiteAI services. Use them only where you have the rights and permissions needed for what you ask them to do. The Terms of Service also apply.",
      ], links: [{ to: "/legal/terms", label: "Terms of Service" }] },
      { id: "prohibited", title: "Prohibited activity", bullets: [
        "Illegal activity, fraud, impersonation, harassment, exploitation or threats of violence.",
        "Sexual content involving children, or material promoting their exploitation or abuse.",
        "Unauthorised access, malware, credential theft, attacks on systems, or attempts to bypass access controls, subscription restrictions or service limits.",
        "Uploading or processing material you have no right to use, including other people’s confidential information or personal data without a lawful basis.",
        "Enrolling another person’s voice or face without informing them and obtaining the permission required by law.",
        "Misrepresenting age or guardian authority, bypassing age safeguards or consent checks, or using the product for covert or unauthorised monitoring.",
      ] },
      { id: "permissions", title: "Access to your device", paragraphs: [
        "Review the files, permissions and actions involved before granting access. XOS1’s ability to carry out a task does not give you permission to access someone else’s device, account or information. Keep control of consequential actions and independently check important results.",
        "Security testing requires the system owner’s authorisation. Report suspected XiteAI vulnerabilities through our security contact rather than accessing customer data or disrupting a live service.",
      ], links: [{ to: "/legal/security", label: "Report a security issue" }] },
      { id: "children", title: "Children and parental access", paragraphs: [
        "The intended under-13 parental-control feature must be used only within its disclosed scope and by an authorised parent or guardian. It is not permission to access unrelated accounts, enrol others’ biometrics or monitor a device without the required notice and authority. The 13–17 experience does not include parental activity monitoring.",
        "Adult capabilities do not permit prohibited content or remove privacy and device-permission requirements.",
      ], links: [{ to: "/legal/minors-policy", label: "Minors Policy" }] },
      { id: "enforcement", title: "Reports and enforcement", paragraphs: [
        "We may investigate reports using information available to us, including service metadata and information supplied in the report. We do not maintain a company conversation-log archive for this purpose.",
        "We may restrict or suspend access to address abuse, security risks or a material breach of the Terms of Service. These measures do not remove refund rights or other protections that applicable law gives you.",
      ] },
    ],
  },
  "refund-policy": {
    contact: "general",
    sections: [
      { id: "subscription", title: "Subscription payments", paragraphs: [
        "XOS1 subscriptions are offered in US dollars (USD) and Indian rupees (INR). The checkout displays the billing period, price, applicable taxes and total charge before payment.",
        "A change of mind or voluntary cancellation does not ordinarily qualify for a refund. Cancelling stops the next renewal; access continues through the paid period. This does not limit cancellation, withdrawal or refund rights required by applicable law.",
      ] },
      { id: "errors", title: "Duplicate or erroneous charges", paragraphs: [
        "We refund every verified duplicate or erroneous charge, regardless of the number of charges. If a failed payment attempt results in a settled charge without the corresponding subscription, we will correct the payment or refund it after verification.",
        "A pending payment authorisation is not necessarily a settled charge. Your bank or payment provider can confirm its status.",
      ] },
      { id: "discontinuation", title: "If we discontinue a paid service", paragraphs: [
        "If XiteAI discontinues a paid service before your paid period ends, the refund for that affected period depends on the time elapsed. Every billing period, including an annual period, is divided into four equal parts.",
      ], table: { head: ["Time elapsed in the paid period", "Refund"], rows: refundRows }, after: [
        "We measure elapsed time from the start of the billing period to the date the service ends, not how often you used it. This schedule is separate from voluntary cancellation. If applicable law requires a greater refund or another remedy, that protection applies.",
      ] },
      { id: "request", title: "Request a review", paragraphs: [
        "Contact support@xiteai.com with the email used for the purchase, the transaction reference, the date and amount, and a short description of the issue. Do not send your password, full card number, card security code or banking credentials.",
        "We may request information needed to verify the transaction. We will explain the outcome of the review. Payment-provider and bank processing times are separate from our review and any refund initiation.",
      ], links: [{ to: "/legal/terms", label: "Read the subscription terms" }] },
    ],
  },
  "beta-terms": {
    contact: "general",
    sections: [
      { id: "release", title: "About this release", paragraphs: [
        "XiteAI Operating System One (XOS1) is launching in beta. During this stage, we will refine the product through continued testing, updates and feedback from people using it.",
        betaLaunchAvailability,
        "Beta describes the release stage, not a lower standard of care. Our commitments to your privacy, support and customer rights continue to apply.",
        "These terms explain what to expect during beta. Read them alongside the Terms of Service and Privacy Policy.",
      ], links: [{ to: "/legal/terms", label: "Terms of Service" }, { to: "/legal/privacy", label: "Privacy Policy" }] },
      { id: "age-safeguards", title: "Age safeguards in beta", paragraphs: [
        productAgeEligibility,
        ageControlsReleaseStatus,
        "Child-data protections apply throughout beta. Before enabling a child-facing feature, the release must verify its age configuration, required notices and consent, provider suitability, and any parental-access controls. Features whose required safeguards are not ready must remain unavailable to the affected users.",
      ], links: [{ to: "/legal/minors-policy", label: "Age bands and guardian involvement" }] },
      { id: "updates", title: "Features and updates", paragraphs: [
        "Features, compatibility and performance may change as XOS1 develops. Some features may have limitations or behave differently across devices. Review the information supplied with your release before relying on a particular capability.",
        "Keep XOS1 up to date and maintain a backup of important files. Check AI responses and proposed actions before using them for decisions that matter.",
        "We intend to move XOS1 to a production release after beta. We will identify that release when it is available. No date is promised, and planned features should not be treated as available today.",
      ] },
      { id: "feedback", title: "Help us improve XOS1", paragraphs: [
        "If something does not work as expected, tell us what happened, which version you are using and how we can reproduce it. You can also share suggestions at feedback@xiteai.com.",
        "Only share information you are comfortable sending. Remove passwords, access tokens and unrelated personal details from screenshots or examples. Reporting an issue does not give us remote access to your device or permission to collect your conversation history.",
      ], links: [{ to: "/legal/support-policy", label: "Contact support" }] },
      { id: "payments", title: "Payments and your rights", paragraphs: [
        "Any paid beta access is governed by the subscription terms and Refund Policy. Beta status does not create a separate refund rule or remove rights provided by applicable law.",
        "Our Privacy Policy continues to govern how information is handled during beta. Taking part in beta is not permission to use your private conversations for model training.",
      ], links: [{ to: "/legal/refund-policy", label: "Refund Policy" }, { to: "/legal/privacy", label: "Privacy Policy" }] },
    ],
  },
  "cookie-policy": {
    contact: "privacy",
    sections: [
      { id: "scope", title: "Scope", paragraphs: [
        "This notice covers browser storage implemented by the XiteAI Terminal website, including its public pages, careers applications and company console. It describes website cookies and browser storage, not the local files used by the XOS1 desktop application.",
        "Cookies can be sent back to the website with requests. Local storage keeps information in your browser until it is cleared. Session storage lasts for the browser tab’s session. None of the items listed below is an advertising identifier.",
      ] },
      { id: "cookies", title: "Access cookies", table: {
        head: ["Name", "Purpose", "Duration"], rows: [
          ["tc_session", "Keeps a signed-in Terminal account authenticated. It is not readable by page JavaScript.", "Expires at the server-configured session limit; sign-out or security checks can end access earlier."],
          ["tc_hiring_access", "Records temporary password access to the Immediate Hire application. It is not readable by page JavaScript.", "Up to two hours. Successful application submission removes it; password rotation invalidates access."],
          ["xtec_privacy", "Records this browser’s privacy choice, the choice version and the time it was saved. It contains no name, email or advertising identifier. It is readable by the website so the choices can be displayed and enforced.", "180 days. A new choice replaces it; browser deletion or expiry causes the notice to appear again."],
        ],
      } },
      { id: "storage", title: "Browser storage", table: {
        head: ["Item", "Purpose", "Duration"], rows: [
          ["tc-join-draft / tc-job-application-{role ID}", "Saves application answers on this browser so a refresh does not lose your draft. Passwords, consent confirmations and skill-proof photos are excluded.", "Until successfully submitted and cleared, or browser storage is deleted."],
          ["tc-product / tc-sidebar", "With permission to remember interface settings, saves the selected product and console sidebar preference.", "Until replaced, permission is withdrawn or expires, or browser storage is deleted."],
          ["tc-code-repo / tc-code-theme", "With permission to remember interface settings, saves the code editor’s selected repository and theme.", "Until replaced, permission is withdrawn or expires, or browser storage is deleted."],
          ["tc-chunk-reload", "Prevents repeated automatic reloads while recovering from an outdated application build.", "The browser tab’s session."],
        ],
      } },
      { id: "controls", title: "Your controls", paragraphs: [
        "On your first visit, the website displays a privacy notice. Choose Only necessary to decline optional interface storage, Allow preferences to permit it, or Manage choices to review the categories. Continuing to browse, closing the choices panel, or pressing Escape does not grant permission.",
        "Open Privacy choices in the footer at any time. Necessary storage supports services you request, such as authentication, application access and draft recovery, and records the privacy choice itself. The optional Remember interface settings control is off until you permit it. Refusing optional storage does not prevent you from browsing, applying or signing in.",
        "When you withdraw permission for interface settings and save the choice, the website removes tc-product, tc-sidebar, tc-code-repo and tc-code-theme from local storage and stops reading or saving those preferences. This does not sign you out, erase an application draft, or delete a submitted application. The interface can still be adjusted for the current visit without saving those adjustments between visits.",
        "The saved privacy choice expires after 180 days. We ask again after it expires or after a change to the choice version for new purposes. If your browser blocks the choice cookie, the selection applies for the current visit and the website explains that it cannot remember it for later visits.",
        "You can delete or block cookies and local storage through your browser. Blocking access cookies prevents sign-in and Immediate Hire access. Clearing local storage removes saved application drafts and interface preferences; it does not delete an application already submitted to XiteAI.",
        "On a shared computer, clear saved application drafts before leaving it. The information saved locally may include personal details you entered into the application.",
        "The website application does not include advertising pixels, session-recording tools or third-party analytics scripts. We do not offer an analytics or advertising switch for a feature that is not implemented. If we introduce optional tracking, it must remain inactive until the relevant permission is obtained, and this notice and the choice version must be updated before use.",
        "These choices apply to this website in this browser. They do not change consent or settings inside the XOS1 desktop application, stop necessary network requests, or control cookies on external websites opened through links. Hosting and security providers may process network information as described in the Privacy Policy; browser-storage choices are not a promise that visiting the site involves no data processing.",
        "A website privacy choice does not verify age, establish guardian authority, enable parental monitoring or provide any separately required consent for a child’s product data. Those decisions belong to the relevant product flow and notice.",
      ], links: [{ to: "/legal/privacy", label: "Privacy Policy" }] },
    ],
  },
  "ai-disclaimer": {
    contact: "general",
    sections: [
      { id: "system", title: "An AI system", paragraphs: [
        "XiteAI Operating System One (XOS1) uses AI to generate responses and assist with tasks. Personalised language, a voice or a simulated emotional state does not make it a human professional. These features should not be relied on as evidence of human judgement or understanding.",
      ] },
      { id: "accuracy", title: "Check important results", paragraphs: [
        "Responses may be incorrect, incomplete, outdated or fabricated, even when expressed confidently. Verify facts, calculations, sources, generated files and proposed actions before relying on them. An answer is not a guarantee that an action was completed.",
        "Market prices, news, search results and other external information depend on their sources and may be delayed or unavailable. Check the original source where the decision matters.",
      ] },
      { id: "advice", title: "Not professional advice", paragraphs: [
        "XOS1 does not replace a qualified financial adviser, lawyer, doctor, therapist or accountant. Its responses are not investment recommendations, medical diagnoses or professional advice. Do not use it as an emergency service or your only basis for a high-stakes decision.",
        "If you need urgent assistance, contact local emergency services or an appropriate qualified professional.",
      ] },
      { id: "control", title: "Stay in control", paragraphs: [
        "Check the scope of permissions you grant and the files or accounts involved. Keep backups. Review consequential actions and generated content before use or publication. Features described as planned, experimental or switched off are not promises of capabilities available in your release.",
      ], links: [{ to: "/legal/terms", label: "Terms of Service" }, { to: "/legal/privacy", label: "How AI requests are processed" }] },
      { id: "age-boundaries", title: "Age-appropriate boundaries", paragraphs: [
        "The intended under-18 experience uses respectful, age-appropriate AI boundaries. These safeguards can reduce risk but cannot guarantee every response is suitable or correct. XOS1 is not a substitute for a parent, teacher, caregiver or qualified professional.",
        "The intended adult configuration at 18 offers broader execution capabilities within lawful use and device permissions. It does not remove the limits in this disclaimer. Age-specific safeguards and the automatic transition have not yet been verified in a customer release.",
      ], links: [{ to: "/legal/minors-policy", label: "Minors Policy" }] },
    ],
  },
  "support-policy": {
    contact: "general",
    sections: [
      { id: "contact", title: "Reach the team", paragraphs: [
        "For XOS1 help, contact support@xiteai.com or use the customer help form on this website. The form accepts product issues, feedback, data-access requests and data-deletion requests. A successfully submitted form returns a reference to keep for follow-up.",
      ], links: [{ to: "https://xtec.xiteai.com/#help", label: "Open the customer help form" }] },
      { id: "details", title: "What to include", bullets: [
        "Your contact email and, if available, the install code shown in XOS1’s Settings → About.",
        "The XOS1 version, your operating system, what you expected and what happened instead.",
        "Steps that reproduce the issue and relevant screenshots with private information removed.",
      ], after: [
        "Support receives what you send. Do not include passwords, API keys, full payment-card details or private conversations unless you deliberately choose to share the relevant excerpt. Sending a support request does not grant the team remote access to your device.",
      ] },
      { id: "scope", title: "Scope of support", paragraphs: [
        "We review installation, update, access, billing and product issues. We may need clarification or an updated version to investigate. We cannot guarantee recovery of local files or data that you have deleted or lost, or the availability of a third-party service.",
        "This policy does not promise a fixed response time or continuous live support. Any additional enterprise support commitment must be stated in a separate agreement.",
      ] },
      { id: "specialist", title: "Specialist requests", table: {
        head: ["Request", "Contact"], rows: [
          ["Product help and payment issues", "support@xiteai.com"],
          ["Product feedback", "feedback@xiteai.com"],
          ["Privacy and deletion requests", "privacy@xiteai.com"],
          ["Child-data, age-setting and parental-access concerns", "privacy@xiteai.com"],
          ["Security vulnerabilities", "security@xiteai.com"],
          ["Legal matters", "legal@xiteai.com"],
          ["Enterprise enquiries", "enterprise@xiteai.com"],
        ],
      } },
      { id: "child-information", title: "Reporting a child-data concern", paragraphs: [
        "Describe the age-setting, consent or parental-access issue and provide the account or install reference if available. Remove unrelated child details from screenshots; do not send a child’s identity documents or complete conversation history unless we explain a specific need and a safe submission method.",
        "We may need to verify the requester’s identity and authority before discussing a child’s records. Support is not an emergency service, and a support ticket does not grant remote access or activate a parental-control feature.",
      ], links: [{ to: "/legal/minors-policy", label: "Minors Policy" }] },
    ],
  },
  "security": {
    contact: "security",
    sections: [
      { id: "controls", title: "Security controls", paragraphs: [
        "The company Terminal checks permissions on the server. Account passwords are stored as password hashes, and sign-in tokens use HttpOnly cookies. Sensitive vault material is encrypted; privileged operations are recorded in an audit trail. Additional verification protects designated sensitive operations.",
        "XOS1 authenticates its install to the company gateway so provider API keys can stay on the server rather than being distributed with customer releases. These controls reduce risk; they do not make the software invulnerable or establish an independent certification.",
      ] },
      { id: "device", title: "Your device and account", paragraphs: [
        "Local XOS1 information depends on the security of your computer and its user account. Use a strong device password, current security updates and disk encryption where appropriate. Keep backups and do not share account credentials or install access tokens.",
        "Only grant permissions you understand. A person with access to your local files or an unlocked account may be able to read or change local information. Local storage does not by itself mean that information is encrypted.",
      ] },
      { id: "report", title: "Report a vulnerability", paragraphs: [
        "Email security@xiteai.com with the affected product or page, the version, reproduction steps and the potential impact. Use a minimal, redacted example. Do not send secrets or other customers’ personal information.",
        "Do not exploit the issue beyond what is necessary to report it, access another person’s account or data, disrupt services, or conduct testing without authorisation. Contact us before any testing that could affect a live system. This notice does not offer a bug-bounty payment or grant testing permission.",
      ] },
      { id: "parental-access", title: "Protecting parental access", paragraphs: [
        "The planned parental-control feature requires verified guardian authority, authenticated access and checks that limit visibility to the authorised child and disclosed activity. Those controls must be tested before release; this notice does not claim a parental dashboard is already available.",
        "Changes of age must update the applicable access configuration without granting administrative rights or expanding device permissions. Ending under-13 parental activity visibility must revoke that access, rather than merely hide a screen. Report unintended access to security@xiteai.com using a redacted example.",
      ], links: [{ to: "/legal/minors-policy", label: "Minors Policy" }] },
      { id: "incidents", title: "Incidents and limitations", paragraphs: [
        "No software or security measure can eliminate every risk. If a personal-data breach triggers a legal notification requirement, we will notify the relevant authorities and affected individuals as required by applicable law. We do not claim that a policy page can prevent an incident.",
      ], links: [{ to: "/legal/privacy", label: "Privacy Policy" }] },
    ],
  },
  "data-deletion": {
    contact: "privacy",
    sections: [
      { id: "local", title: "Data on your computer", paragraphs: [
        "XOS1 stores its conversation history, memories and many app records locally. Its factory-reset function clears the app’s user state, including conversation history, memory records and biometric templates, and removes generated files in the app’s Assets workspace. Export or back up anything you want to keep before a reset.",
        "A reset is not a secure wipe of your disk. It does not erase copies you exported, operating-system backups, files outside its reset scope or information held by third parties. Uninstalling software should not be treated as proof that all associated local data has been removed.",
      ] },
      { id: "sharing", title: "Stop optional reporting", paragraphs: [
        "XOS1’s Privacy controls separately govern optional profile and usage reporting. Both default to off. Withdrawing profile sharing clears the name and date of birth in the current install record when the next check-in reaches the server.",
        "Withdrawing usage sharing stops new tool-usage details being reported. It does not automatically delete historical check-in records. Basic install, version, update and crash information is separate from optional sharing.",
      ] },
      { id: "request", title: "Request company-held data deletion", paragraphs: [
        "Contact privacy@xiteai.com or choose “Delete my data” in the customer help form. Identify the account, install code or request reference involved and the information you want deleted. We may need to verify that you are entitled to make the request.",
        "We will assess the request and respond within the period required by applicable law. Local reset and a request to delete company-held information are separate actions. Deletion does not itself cancel a subscription or create a refund entitlement.",
      ], links: [{ to: "https://xtec.xiteai.com/#help", label: "Customer help form" }, { to: "/legal/refund-policy", label: "Refund Policy" }] },
      { id: "child-records", title: "Children’s records and guardian requests", paragraphs: [
        guardianAccess,
        "Identify the records and request involved without sending unnecessary child information. Where valid consent is withdrawn, affected consent-based processing must stop unless a legal exception applies; deletion and any necessary retention are assessed separately. We will explain records we are required to keep and why.",
        "Turning parental visibility off, deleting local records and requesting deletion of company-held information are different actions. Any parental-activity or guardian-verification records introduced by a release must have a disclosed deletion scope and retention schedule. A birthday or local reset does not automatically erase copies held elsewhere.",
      ], links: [{ to: "/legal/minors-policy", label: "Minors Policy" }, { to: "/legal/privacy", label: "Privacy Policy" }] },
      { id: "limits", title: "Records and other recipients", paragraphs: [
        "Some records may need to be kept to meet legal obligations, resolve a dispute or protect service security. Where information cannot be deleted, we will explain the applicable reason. This page does not promise an immediate purge of every backup.",
        "A local reset does not recall information already processed by an AI provider or another external service. Provider retention and your rights depend on the applicable service and agreement. See the Privacy Policy for the distinction between processing, stored records and planned zero-retention requirements.",
      ], links: [{ to: "/legal/privacy", label: "Privacy Policy" }] },
    ],
  },
  "minors-policy": {
    contact: "privacy",
    sections: [
      { id: "age", title: "An age-appropriate experience", paragraphs: [productAgeEligibility,ageControlsReleaseStatus], table: {
        head:["Age band","Intended experience"], rows:productAgeBands.map(band => [band.label,band.description]),
      } },
      { id: "age-information", title: "Age information and corrections", paragraphs: [ageDataUse,"Provide an accurate date of birth. Contact privacy@xiteai.com if an incorrect age has selected the wrong experience. Any correction must preserve required consent and access protections; it must not be used to bypass safeguards."] },
      { id: "adult-transition", title: "Turning 18", paragraphs: [adultTransition,ageTransitionLimits,"An age calculation alone is not proof that model configuration, access controls or parental visibility have been updated. The automatic transition must be verified in the release that offers it."] },
      { id: "consent", title: "Consent and guardian involvement", paragraphs: [consentAndControls,"A guardian acknowledgement during onboarding does not, by itself, establish that a legally required verifiable-consent process has been completed. Required notices, verification and permissions must be in place before the relevant child-data processing is enabled."] },
      { id: "parental-controls", title: "Parental activity visibility", paragraphs: ["The intended parental-control feature is for users under 13 and is optional as a product setting. When enabled, it is intended to provide a parent or guardian with visibility into the child’s XOS1 activity. The intended experience for users aged 13–17 does not include parental activity monitoring.","The release must explain the scope of information shared, how parental access is verified, where the information is processed and retained, and how the controls are enabled and disabled. This notice does not promise a currently available parental dashboard or unrestricted visibility into every activity on a device.","Explain activity visibility to the child and guardian before it is enabled. When a user reaches 13, the intended design ends parental activity visibility; the release must verify that access is revoked. This product setting does not remove any separate guardian-consent or request rights required by law."] },
      { id: "sensitive-features", title: "Recognition, inference and cloud processing", paragraphs: [
        "General account terms or a parental-control setting do not authorise biometric enrolment, emotional inference or every cloud data flow. Each feature must satisfy applicable child-data restrictions, notices and permissions before it is enabled. Prohibited processing must remain disabled even if a guardian wishes to enable it.",
        "Children’s information must not be collected beyond what is needed for a permitted, disclosed purpose. Before release, provider agreements and settings must support the relevant age groups and processing, and any new child or guardian records must have a defined retention and deletion schedule.",
      ], links: [{ to: "/legal/privacy", label: "Privacy Policy" }] },
      { id: "rights", title: "Requests and withdrawal", paragraphs: [guardianAccess,"If legally required consent is refused or withdrawn, the affected processing must not begin or must stop, subject to applicable legal exceptions. This may make the affected feature unavailable. Disabling optional activity visibility is separate from withdrawing consent or requesting deletion."] },
      { id: "others", title: "Respect other people’s information", paragraphs: ["Do not enrol another person’s voice or face, submit their personal information or access their activity without the permissions and lawful basis required for that use. A parental relationship is not a substitute for the release’s consent, access and privacy controls."], links: [{ to: "/legal/acceptable-use-policy", label: "Acceptable Use Policy" }] },
      { id: "report", title: "Tell us about an issue", paragraphs: [
        "For a child-safety concern, an incorrect age configuration, a parental-control problem or a question about a child’s personal information, contact privacy@xiteai.com. Provide only what is needed to identify the issue; do not send unnecessary identification documents or further sensitive information.",
        "We will investigate and take appropriate steps, including restricting access or deleting information we are not permitted to hold. We may need to verify the request. The Data Deletion policy explains the separate treatment of local data and company records.",
      ], links: [{ to: "/legal/data-deletion", label: "Data Deletion" }] },
    ],
  },
};
