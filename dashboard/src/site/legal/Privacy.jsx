import { Clause, DocTable } from "./prose.jsx";
import LegalLayout from "./LegalLayout.jsx";
import { productAgeEligibility, productAgeBands, ageControlsReleaseStatus, consentAndControls, guardianAccess, ageDataUse, ageTransitionLimits } from "../agePolicy.js";
import { company, site, showCompany, staysLocal, leavesDevice } from "../content.js";

// Shared ledger data and founder-confirmed operator information. Provider
// contracts and account controls must be verified before stronger promises are added.

const rail = [
  {
    title: "Privacy",
    items: [
      { href: "#ledger", label: "Where your data goes" },
      { href: "#p1", label: "1 · Who we are" },
      { href: "#p2", label: "2 · What we collect" },
      { href: "#p3", label: "3 · Voice & face" },
      { href: "#p4", label: "4 · Emotional state" },
      { href: "#p5", label: "5 · Who else sees it" },
      { href: "#p6", label: "6 · Why we're allowed" },
      { href: "#p7", label: "7 · How long we keep it" },
      { href: "#p8", label: "8 · Your rights" },
      { href: "#p9", label: "9 · Security" },
      { href: "#p10", label: "10 · Children" },
      { href: "#p11", label: "11 · Contact" },
    ],
  },
];

function Col({ tone, head, note, rows }) {
  return (
    <div className={`ledger-col ledger-${tone}`}>
      <div className="ledger-head">
        <b>{head}</b>
        <span className="ledger-note">{note}</span>
      </div>
      <ul>
        {rows.map((r) => (
          <li key={r.what}>
            <b>{r.what}</b>
            <span>{r.where}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Ledger() {
  return (
    <div className="ledger">
      <Col tone="on" head="Stored or processed locally"
        note="Local records are separate from the text and context sent in an AI request."
        rows={staysLocal} />
      <Col tone="off" head="Sent outside your device"
        note="AI processing, service operation and optional reporting have different data flows."
        rows={leavesDevice} />
    </div>
  );
}

export default function Privacy() {
  return (
    <LegalLayout slug="privacy" rail={rail} contact={site.contact.privacy}>
      <section id="ledger" style={{ scrollMarginTop: "6rem" }}>
        <h2>Where your data actually goes</h2>
        <p>This notice covers XOS1 and the XiteAI Terminal website. It distinguishes local records, temporary AI processing and information stored by the company.</p>
        <Ledger />
      </section>

      <Clause n="1" id="p1" title="Who we are">
        <p>
          {site.name} ({site.shortName}) is provided by {company.legalName} (CIN {company.cin}),
          whose registered office is at {company.registeredOffice}.
          For privacy questions, contact <a href={`mailto:${site.contact.privacy}`}>{site.contact.privacy}</a>.
        </p>
      </Clause>

      <Clause n="2" id="p2" title="What we collect, and where it lives">
        <p>XOS1 runs mostly on your own computer. The distinction above is the most important thing in this policy.</p>
        <p><strong>Local records.</strong> XOS1 stores conversation history, memories, notes, calendar entries, wallet records and generated files on your computer. Voice transcription and biometric-template processing take place locally in the reviewed release. Local storage does not mean that the text is excluded from cloud AI processing.</p>
        <p><strong>AI requests.</strong> Conversation text and relevant context pass through XiteAI’s gateway to the configured AI provider. Context can include saved memories, app activity, notes or text extracted from an open workspace document. The reviewed gateway relays requests and responses without saving their content as company conversation logs. Temporary processing is distinct from storing an archive.</p>
        <p><strong>Service records.</strong> Basic check-ins report an install identifier, signing public key, build and app version, operating-system version, device type, language, time zone, update status and crash counts. Network addresses and request metadata may also be processed for access control, security and service operation. Profile sharing can send a name and date of birth; usage sharing can send tool names. Those two optional controls default to off.</p>
        <p>Download counters record a timestamp, a hashed network address, available country information and the referring page. These records do not contain your AI conversations.</p>
        <p><strong>Information you submit.</strong> Support requests contain the contact details, install code and message you provide. Careers applications can include your contact and address details, date of birth, photograph, education, experience, skills, work samples, links, application answers and emergency-contact details. Company accounts also generate authentication and security records. These are company-held records, not an automatic upload of your XOS1 conversation history.</p>
        <p>Search terms, market symbols and location queries are sent to the relevant external services when used. The reviewed desktop release does not send raw microphone audio, camera frames or biometric templates through its AI gateway.</p>
        <p><strong>Age and guardian information.</strong> {ageDataUse} Guardian contact details, consent evidence and activity-access records are not represented here as data already collected by a released parental-control feature.</p>
      </Clause>

      <Clause n="3" id="p3" title="Voice and face recognition">
        <p>XOS1 can learn to recognise you by voice and, when camera features are enabled, by face. It creates mathematical templates rather than storing the template as a raw recording or photograph. Templates can identify a person and must still be treated as sensitive information.</p>
        <p>These templates are <strong>biometric identifiers</strong> and are treated as sensitive personal data. They are:</p>
        <ul>
          <li>stored on your device only, never transmitted to us or anyone else;</li>
          <li>never sold, leased, traded or used for advertising;</li>
          <li>removed by the app’s factory-reset function; this is not a secure wipe of external backups or your disk;</li>
        </ul>
        <p>The camera is off by default. With it off, it is never opened, sampled or read.</p>
        <p>A recognised name or label may be included in AI context. The voiceprint or faceprint used to make that recognition stays on your device. A recognition label and a biometric template are different kinds of information.</p>
        <p>For the beta launch, we intend to make biometric recognition optional, with a separate choice before enrolment and controls to disable recognition or delete templates. These controls must be implemented before the features are enabled for customers. The development build currently learns a voiceprint during onboarding without a separate opt-in, so it does not yet meet that intended launch design.</p>
        <p>A child’s biometric enrolment requires its own review of applicable permissions and consent. Accepting general terms, enabling parental controls or allowing microphone transcription does not by itself authorise biometric recognition. A child-facing release must verify the necessary choices and a non-biometric alternative before enabling enrolment.</p>
      </Clause>

      <Clause n="4" id="p4" title="Emotional state and tone">
        <p>The reviewed release analyses characteristics of spoken turns to estimate indicators such as tiredness or energy. The audio analysis runs locally; an interpretation or summary may be included in the cloud AI context. These estimates can be wrong and are not measurements of your mental health.</p>
        <p>Separate Emotional Presence and Pulse typing features are built but off by default. Pulse, when enabled, measures timings and counts in XOS1’s own chat box, not a system-wide record of keystrokes. Its local typing profile is separate from a short summary that can accompany an AI request. Planned long-term inference features are not represented as active here.</p>
        <p>XOS1 uses AI. It is not a person or a therapist, and its responses are not clinical judgements about your mental state.</p>
        <p>Age-appropriate language does not make emotional or behavioural inference lawful for every child or jurisdiction. Before offering these features to children, we must check the applicable restrictions and disable processing that is not permitted. Optional parental visibility is not permission for unrestricted tracking or profiling of a child.</p>
      </Clause>

      <Clause n="5" id="p5" title="Who else sees your data">
        <p>The following services appear in the reviewed development build. This is not a confirmation of the final production provider list. DeepInfra is used for development testing; Cerebras and Groq are being evaluated for the beta launch.</p>
        <DocTable
          head={["Provider", "What it receives", "Purpose"]}
          rows={[
            [<b key="a">DeepInfra, development testing only</b>, "AI request text and relevant context through XiteAI’s gateway", "Development model calls, including replies, tool selection and memory extraction; not selected as the launch provider"],
            [<b key="c">DuckDuckGo · Brave · Yahoo</b>, "Your search phrase", "Answering questions about current events"],
            [<b key="d">Yahoo Finance · CoinGecko · NSE</b>, "The symbols you look up", "Prices and market data"],
            [<b key="e">Open-Meteo</b>, "The city or coordinates you save", "Weather"],
            [<b key="f">News publishers · Wikimedia</b>, "A category or a date", "Headlines and “on this day”"],
            [<b key="g">GitHub · Hugging Face</b>, "Version or download requests and ordinary network metadata", "Updates and model downloads when used"],
          ]}
        />
        <p>We do not sell your personal data, and we do not share it for advertising.</p>
        <p><strong>Our provider requirements.</strong> XiteAI’s planned production policy requires zero retention of customer prompts and responses. We will not use customer content for model training or authorise our providers to do so. We are still confirming the applicable agreements, features and account controls, so zero retention is not yet a verified guarantee across every provider we use.</p>
        <p><a href="https://docs.deepinfra.com/account/data-privacy" target="_blank" rel="noreferrer">DeepInfra’s published data policy</a> describes no training on ordinary inference content and temporary in-memory processing. It lists separate treatment for some model providers, image-generation outputs and bulk inference. The protections applicable to a request depend on the model and features used, not just the provider’s name.</p>
        <p>Cerebras and Groq are candidates, not confirmed production recipients. We will identify the providers used by the customer release and update this notice before enabling those cloud features. Provider selection does not by itself confirm an agreement or an account’s retention settings.</p>
      </Clause>

      <Clause n="6" id="p6" title="Why we are allowed to process it">
        <DocTable
          head={["Purpose", "Basis to assess where GDPR applies"]}
          rows={[
            ["Running the conversation you started", "Performance of a contract, Art. 6(1)(b)"],
            ["Voice and face recognition", <span key="x"><b>Explicit consent</b>, Art. 9(2)(a), withdrawable at any time</span>],
            ["Emotion inference", "Consent where permitted and required; withdrawal controls must be verified before release"],
            ["Security, abuse prevention, crash diagnostics", "Legitimate interests, Art. 6(1)(f)"],
            ["Billing and tax records", "Legal obligation, Art. 6(1)(c)"],
          ]}
        />
        <p>We must provide the notices and obtain any consent required by applicable law before the relevant processing. Listing a lawful basis here does not replace a consent control in the product. India’s DPDP framework has phased commencement; applicable obligations depend on the provisions in force and the processing involved.</p>
        <p>Contract acceptance, optional website storage, guardian consent and optional recognition are separate decisions. No single checkbox authorises every purpose. For children, the appropriate basis, notice and any required verifiable guardian consent must be assessed for each relevant data flow, including cloud AI processing.</p>
      </Clause>

      <Clause n="7" id="p7" title="How long things are kept">
        <p><strong>On your device:</strong> records follow the app’s local storage and deletion behavior. Factory reset clears the app’s user state, including its conversation history, memory records and biometric templates. It does not securely wipe your disk or erase exported copies or external backups.</p>
        <p><strong>With our AI providers:</strong> our planned production requirement is zero retention of customer prompts and responses. We are still verifying this for each provider and account. Zero retention of conversation content does not mean that account, billing or service-usage metadata is never retained.</p>
        <p>DeepInfra’s published policy separates inference content from operational metadata and describes exceptions for particular models and features. We do not treat a published provider policy as proof of an unverified account setting or an enterprise agreement.</p>
        <p><strong>With us:</strong> the reviewed gateway does not save request or response bodies as conversation logs. Install/check-in, support, application, account and security records are separate. A single retention schedule for those records and backups has not yet been confirmed; we do not promise automatic deletion after an invented period.</p>
        <p>Turning profile sharing off clears the optional profile fields at the next successful check-in. Turning usage sharing off stops future tool reports but does not automatically erase historical check-ins. For deletion requests, see <a href="/legal/data-deletion">Data Deletion</a>.</p>
        <p>Any child-data, guardian-verification or parental-activity records introduced by a release must have a stated purpose and a retention and deletion schedule before collection begins. They must not be kept indefinitely simply because an account remains available. That schedule and the corresponding controls have not yet been verified for the planned parental-control feature.</p>
      </Clause>

      <Clause n="8" id="p8" title="Your rights">
        <p>You can manage local records on your computer separately from requesting access to or deletion of company-held records.</p>
        <p>Depending on applicable law, you may request access, correction, deletion, portability or restriction of personal information, withdraw consent, object to processing, or complain to a competent authority. These rights can have conditions and exceptions. We do not sell personal information or share it for advertising; no advertising opt-out is needed for a sale or advertising-sharing practice we do not undertake.</p>
        <p>Write to <a href={`mailto:${site.contact.privacy}`}>{site.contact.privacy}</a>. We will respond within the period required by applicable law and may need to verify your identity before acting on a request. We will not treat you differently for exercising your privacy rights.</p>
        <p>{guardianAccess} Required verification must be proportionate to the request; do not send identification documents unless we explain why they are needed and how to supply them safely.</p>
      </Clause>

      <Clause n="9" id="p9" title="Security">
        <p>Data in transit is encrypted with TLS. Your local data sits in your operating system’s user profile, protected by your device’s own account security. <strong>Which means anyone who can log into your computer can read it.</strong> Put a password on your machine, and encrypt the disk if the contents matter.</p>
        <p>If a breach affects your personal data we will notify the relevant regulator within 72 hours where required, and tell you without undue delay.</p>
      </Clause>

      <Clause n="10" id="p10" title="Children and age-appropriate experiences">
        <p>{productAgeEligibility}</p>
        <ul>{productAgeBands.map(band => <li key={band.id}><strong>{band.label}.</strong> {band.description}</li>)}</ul>
        <p>{consentAndControls}</p>
        <p>The parental-control design concerns activity in XOS1. Before it is enabled in a release, the notice must explain which information a parent or guardian can see, how their access is verified, where the information is processed and retained, and how the control can be disabled. This policy does not promise visibility into everything a child does across their devices.</p>
        <p>Children and guardians must receive an understandable explanation of any activity visibility before it is enabled. Turning monitoring off is separate from withdrawing legally required consent or deleting records. If required consent is refused or withdrawn, the affected processing must not start or must stop, subject to applicable legal exceptions; this may make the affected feature unavailable.</p>
        <p>{ageTransitionLimits} The release must also verify that parental activity access ends when the user leaves the under-13 band. Legal guardian-request rights are assessed separately from a product monitoring setting.</p>
        <p>{ageControlsReleaseStatus} The <a href="/legal/minors-policy">Minors Policy</a> gives the full scope. Contact <a href={`mailto:${site.contact.privacy}`}>{site.contact.privacy}</a> about consent, access or deletion of a child’s information.</p>
      </Clause>

      <Clause n="11" id="p11" title="Contact, and changes">
        <p>For privacy requests or complaints, contact <a href={`mailto:${site.contact.privacy}`}>{site.contact.privacy}</a>.{" "}
          {showCompany
            ? <>Our {company.grievance.designation} is {company.grievance.name}, reachable at <a href={`mailto:${company.grievance.email}`}>{company.grievance.email}</a>.</>
            : "A grievance officer has not yet been appointed."}</p>
        <p>No EU or UK representative has been appointed. This policy does not claim that representative requirements, where applicable, have been satisfied.</p>
        <p>We will explain material changes through an appropriate notice before new processing begins and obtain fresh consent where required. Continuing to use XOS1 or browse this website does not by itself provide consent to a new data-processing purpose. An updated notice does not substitute for the controls required in the release.</p>
      </Clause>
    </LegalLayout>
  );
}
