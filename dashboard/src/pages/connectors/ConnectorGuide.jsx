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
          <p className="ld-updated">Last updated <time dateTime="2026-11-11">11 November 2026</time></p>
        </header>
        <div className="ld-body">
          <article className="prose-legal ld-article">
            <p className="cg-intro">Connectors are an optional part of XOS1, XiteAI’s Windows personal assistant. They are designed to bring information from accounts you choose into your conversations. Enabling a setting and granting access to an external account are separate choices.</p>

            <Clause n="01" id="permission" title="Permission comes first">
              <p>Open Connectors in XOS1 Settings to review its permission page. Closing the page does not grant permission. Allowing Connectors reveals the provider controls; it does not sign you into Gmail or authorise a mailbox.</p>
              <p>You choose which provider to enable. Connecting an account requires a successful sign-in and consent through that provider. A local preference or an account label alone does not authorise access.</p>
            </Clause>

            <Clause n="02" id="sign-in" title="Connecting an account">
              <p>A Gmail connection has three permission steps:</p>
              <ol className="cg-steps">
                <li><strong>Choose Gmail.</strong><span>Enable the provider and select Add mail in Connectors.</span></li>
                <li><strong>Choose your Google account.</strong><span>Sign in on Google’s page in your browser and review the requested access. XOS1 does not need your Google password.</span></li>
                <li><strong>Review the connection.</strong><span>The account’s name, photo and email identify which account you are authorising. A cancelled or unsuccessful sign-in does not authorise a connection.</span></li>
              </ol>
              <p>The connector permission page inside XOS1 and Google’s account-authorisation page serve different purposes. Neither is a substitute for the other.</p>
            </Clause>

            <Clause n="03" id="gmail" title="What Gmail access is for">
              <p>Gmail access lets you read recent messages from the accounts you authorise. Read recent mail shows the latest messages from today and yesterday. Select a message to read its text in the temporary mail view.</p>
              <dl className="cg-permissions">
                <div><dt>Account identity</dt><dd>Google sign-in (<code>openid</code>) identifies the account you authorised. Your email address, name and photo (<code>userinfo.email</code> and <code>userinfo.profile</code>) identify and display it in Connectors.</dd></div>
                <div><dt>Read-only mail</dt><dd><code>gmail.readonly</code> permits reading message headers, labels and content. Message content can be needed to understand a request, deadline or change that the subject line alone does not explain.</dd></div>
              </dl>
              <p>The requested Gmail permission is read-only. It does not grant permission to send, edit or delete email, change Gmail settings, or access Google Drive or Google Calendar. Additional permissions require their own explanation and authorisation.</p>
            </Clause>

            <Clause n="04" id="accounts" title="Your different accounts">
              <p>The account controls are designed for up to five Gmail accounts, with optional names such as Personal or Work. You can choose one main account or leave that choice unset. The main-account label does not grant additional permissions.</p>
              <p>Account names and preferences help distinguish accounts; they do not create a Google session. Each account requires its own successful authorisation.</p>
            </Clause>

            <Clause n="05" id="data" title="Where information goes">
              <p>Connector preferences and account identity are saved locally. Account credentials are stored separately, protected by Windows for your user account on this device. Credentials are excluded from Ecosystem sync and portable exports.</p>
              <p>The mail reader fetches messages directly from Google into a temporary view. It makes no AI requests and does not save a mailbox archive. Account access and any additional AI processing are separate decisions, each requiring an appropriate explanation and permission.</p>
              <p>Google account data will be used for the disclosed connector features. It will not be sold, used for advertising or credit decisions, or used to train general-purpose AI models. Its use and transfer must follow Google’s <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">User Data Policy</a>, including Limited Use, and the <a href="https://developers.google.com/workspace/workspace-api-user-data-developer-policy" target="_blank" rel="noreferrer">Workspace user data policy</a>.</p>
              <p>Permission to read email does not authorise unrelated uses of its contents. Review the Privacy Policy’s Google accounts section for storage, processing and deletion information.</p>
            </Clause>

            <Clause n="06" id="control" title="Pausing and disconnecting">
              <p>Pausing suspends account activity while retaining the protected connection. Disconnecting removes the account’s credentials and preferences from the device and requests Google revocation. If Google cannot be reached, XOS1 tells you to review access in your Google Account connections.</p>
              <p>Once a Google connection exists, you can also revoke its access from your <a href="https://myaccount.google.com/connections" target="_blank" rel="noreferrer">Google Account connections</a>. Revocation stops future authorised access; it does not itself erase information already processed or exported.</p>
            </Clause>

            <Clause n="07" id="policies" title="Policies and questions">
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
