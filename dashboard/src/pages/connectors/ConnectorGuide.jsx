import { usePageMeta } from "../../lib/seo.jsx";
import { Link } from "../../site/CanonicalLink.jsx";
import { Clause } from "../../site/legal/prose.jsx";
import RailNav from "../../site/legal/RailNav.jsx";
import { connectorGuideMeta } from "./connectorGuideMeta.js";
import "../../site/site.css";
import "./ConnectorGuide.css";

const contents = [{ title: "In this guide", items: [
  { href: "#permission", label: "Permission comes first" },
  { href: "#sign-in", label: "Connecting an account" },
  { href: "#gmail", label: "What Gmail access is for" },
  { href: "#accounts", label: "Your different accounts" },
  { href: "#data", label: "Where information goes" },
  { href: "#control", label: "Pausing and disconnecting" },
  { href: "#availability", label: "What is available today" },
  { href: "#policies", label: "Policies and questions" },
] }];

export default function ConnectorGuide() {
  usePageMeta(connectorGuideMeta);
  return (
    <div className="site connector-guide">
      <main className="site-wrap cg-main" id="main-content">
        <header className="ld-head cg-head">
          <p className="cg-eyebrow">XOS1 / Documentation</p>
          <h1>How Connectors Work</h1>
          <p className="ld-sum">Your accounts, connected with your permission. A guide to what you allow, what the assistant can read and the controls that keep the choice yours.</p>
          <p className="ld-updated">Last updated <time dateTime="2026-11-10">10 November 2026</time></p>
        </header>
        <div className="ld-body">
          <article className="prose-legal ld-article">
            <div className="cg-status" role="note" aria-label="Current connector status">
              <p className="cg-status-label"><span aria-hidden="true" />Connection status</p>
              <p><strong>Gmail sign-in is in development.</strong> The current build provides connector permission and account-preference controls. It does not connect to Google, obtain account tokens or read email. Outlook access is also unavailable.</p>
            </div>
            <p className="cg-intro">Connectors are an optional part of XOS1, XiteAI’s Windows personal assistant. They are designed to bring information from accounts you choose into your conversations. Enabling a setting and granting access to an external account are separate choices.</p>

            <Clause n="01" id="permission" title="Permission comes first">
              <p>Open Connectors in XOS1 Settings to review its permission page. Closing the page does not grant permission. Allowing Connectors reveals the provider controls; it does not sign you into Gmail or authorise a mailbox.</p>
              <p>You choose which provider to enable. An account will only become connected after the provider’s own sign-in and consent process has succeeded. That sign-in step is not available in the current build.</p>
            </Clause>

            <Clause n="02" id="sign-in" title="Connecting an account">
              <p>When Google sign-in becomes available, the intended flow is:</p>
              <ol className="cg-steps">
                <li><strong>Choose Gmail.</strong><span>Enable the provider and select Add mail in Connectors.</span></li>
                <li><strong>Choose your Google account.</strong><span>Sign in on Google’s page in your browser and review the requested access. XOS1 does not need your Google password.</span></li>
                <li><strong>Review the connection.</strong><span>The account’s name, photo and email will identify it in XOS1. A cancelled or unsuccessful sign-in will not count as a connected account.</span></li>
              </ol>
              <p>The connector permission page inside XOS1 and Google’s account-authorisation page serve different purposes. Neither is a substitute for the other.</p>
            </Clause>

            <Clause n="03" id="gmail" title="What Gmail access is for">
              <p>The planned first Gmail feature will help you catch important messages received today and relevant mail from yesterday that the assistant has not already covered. It will prepare short summaries from the accounts you connect.</p>
              <dl className="cg-permissions">
                <div><dt>Account identity</dt><dd>Google sign-in (<code>openid</code>) identifies the account you authorised. Your email address, name and photo (<code>userinfo.email</code> and <code>userinfo.profile</code>) identify and display it in Connectors.</dd></div>
                <div><dt>Read-only mail</dt><dd><code>gmail.readonly</code> permits reading message headers, labels and content. Message content can be needed to understand a request, deadline or change that the subject line alone does not explain.</dd></div>
              </dl>
              <p>This planned connection will not send, edit or delete email, change Gmail settings, or grant access to Google Drive or Google Calendar. Additional capabilities would require their own explanation and any additional authorisation.</p>
            </Clause>

            <Clause n="04" id="accounts" title="Your different accounts">
              <p>The account controls are designed for up to five Gmail accounts, with optional names such as Personal or Work. You can choose one main account or leave that choice unset. The main-account label does not grant additional permissions.</p>
              <p>These preferences help distinguish accounts; they do not create a Google session. Each account will need its own successful authorisation when sign-in is available.</p>
            </Clause>

            <Clause n="05" id="data" title="Where information goes">
              <p><strong>Today:</strong> connector permissions, provider preferences and account display metadata are saved locally. This connector currently collects no Google account tokens or Gmail messages.</p>
              <p><strong>Planned mail summaries:</strong> selected message content may need to pass through XiteAI’s gateway to a configured AI provider. Mail summarisation is not described as entirely on-device. Before this is enabled, the in-app notice and Privacy Policy will identify the recipients, purposes, retention and required permission.</p>
              <p>Google account data will be used for the disclosed connector features. It will not be sold, used for advertising or credit decisions, or used to train general-purpose AI models. Its use and transfer must follow Google’s <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">User Data Policy</a>, including Limited Use, and the <a href="https://developers.google.com/workspace/workspace-api-user-data-developer-policy" target="_blank" rel="noreferrer">Workspace user data policy</a>.</p>
              <p>Credential protection, any message or summary cache, retention periods and deletion controls must be documented and working before mailbox access is enabled. This guide does not claim those unfinished features are already protecting connected accounts.</p>
            </Clause>

            <Clause n="06" id="control" title="Pausing and disconnecting">
              <p>The intended controls will let you pause an account, disable a provider or disconnect an account. They must stop the relevant future mail access and notification processing. Disconnecting must also remove stored credentials and attempt to revoke the provider’s authorisation.</p>
              <p>Once a Google connection exists, you can also revoke its access from your <a href="https://myaccount.google.com/connections" target="_blank" rel="noreferrer">Google Account connections</a>. Revocation stops future authorised access; it does not itself erase information already processed or exported.</p>
              <p>In the current build, toggles change local preferences only. Working token revocation, mailbox pause and deletion behavior remain part of the sign-in implementation.</p>
            </Clause>

            <Clause n="07" id="availability" title="What is available today">
              <ul className="cg-availability">
                <li><strong>Built:</strong> the Connectors permission page, Gmail preference controls and local account-preference management.</li>
                <li><strong>In development:</strong> Google sign-in, secure token storage, mail reading, important-mail selection and summaries.</li>
                <li><strong>Later:</strong> Outlook sign-in and mail access. Its provider option remains unavailable.</li>
              </ul>
              <p>There is no live Mail notification queue in this connector build. These descriptions explain the intended experience and its current limits; they are not a Google verification or approval claim.</p>
            </Clause>

            <Clause n="08" id="policies" title="Policies and questions">
              <p>Read our <Link to="/legal/privacy#google-accounts">Privacy Policy’s Google accounts section</Link> for the data disclosures, the <Link to="/legal/terms">Terms of Service</Link> for using XOS1 and the <Link to="/legal/acceptable-use-policy">Acceptable Use Policy</Link> for prohibited uses.</p>
              <p>For questions about account data, consent or deletion, contact <a href="mailto:privacy@xiteai.com">privacy@xiteai.com</a>.</p>
            </Clause>
          </article>
          <aside className="ld-rail"><RailNav groups={contents} /></aside>
        </div>
      </main>
    </div>
  );
}
