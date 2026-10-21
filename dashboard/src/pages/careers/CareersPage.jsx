import { useEffect } from "react";
import { Link } from "../../site/CanonicalLink.jsx";
import { usePageMeta } from "../../lib/seo.jsx";
import SiteFooter from "../../site/SiteFooter.jsx";
import SiteNav from "../../site/SiteNav.jsx";
import StruckWord from "../../site/StruckWord.jsx";
import WallScene from "../../site/WallScene.jsx";
import IntentSculpture from "../../components/IntentSculpture.jsx";
import { XITEAI_CODE } from "../../site/xiteaiCode.js";
import interviewProcessArt from "../../assets/careers/interview-process.jpg";
import "../shared/Entry.css";
import "./Careers.css";
import "./CareersEditorial.css";

export default function CareersPage() {
  usePageMeta({
    title: "Careers · XiteAI",
    description: "Join XiteAI and build the AI layer for the personal computer. View open roles across engineering, design and more.",
    path: "/careers",
  });
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return <div className="site pub cr-landing">
    <SiteNav />
    <main className="cr-landing-main site-top">
      <section className="careers-entrance" aria-labelledby="careers-entrance-title">
        <div className="careers-entrance-copy">
          <p className="careers-entrance-label">Careers at XiteAI</p>
          <h1 id="careers-entrance-title">Build what<br /><em>comes next.</em></h1>
          <p className="careers-entrance-intro">A new way for people and computers to work together. Help us bring it to life.</p>
          <Link to="https://xtec.xiteai.com/careers/open-roles" className="cr-landing-cta">View open roles <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="careers-entrance-art"><IntentSculpture mode="portal" /></div>
      </section>
      <section className="careers-immediate" aria-labelledby="immediate-hire-title">
        <div>
          <h2 id="immediate-hire-title">Immediate hire</h2>
          <p>For candidates invited directly by XiteAI.</p>
        </div>
        <Link to="https://xtec.xiteai.com/join" className="cr-landing-cta">Immediate Hire <span aria-hidden="true">→</span></Link>
      </section>
      <section className="careers-work" aria-labelledby="how-we-work-title">
        <WallScene className="careers-work-art" />
        <div className="careers-work-body">
          <h2 id="how-we-work-title">How we work</h2>
          {XITEAI_CODE.map((rule) => <div key={rule.id} className="careers-work-rule">
            {rule.struck ? <StruckWord word={rule.struck} label={rule.title} /> : <h3>{rule.title}</h3>}
            <p>{rule.text}</p>
          </div>)}
          <div className="careers-policy-reference"><p>We are documenting proposed working practices for clear decisions, repeatable processes and early reporting of problems.</p><Link to="/legal/company-policy">Read XiteAI Company Policy <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
      <section className="careers-process" aria-labelledby="interview-process-title">
        <h2 id="interview-process-title">Interview process</h2>
        <ol className="careers-process-steps" role="list">
          <li>
            <h3>Application and review</h3>
            <p>Submit your application with videos and a description of your exceptional work. The XiteAI team reviews your work, your contribution, and the thinking behind it.</p>
          </li>
          <li>
            <h3>Screening interview</h3>
            <p>A conversation about your experience, the work you’ve shared, and your interest in the role. It’s also a chance to ask us questions.</p>
          </li>
          <li>
            <h3>Role-specific interview</h3>
            <p>We explore problems in your field to understand how you think critically, weigh trade-offs, and develop solutions. For technical roles, this includes a deeper discussion of your technical skills.</p>            <p>We don’t use standard coding tests. If a practical exercise is part of your interview, it will be open-ended. You’re free to use the internet, and we’ll record the time you take.</p>
          </li>
          <li>
            <h3>Offer and joining</h3>
            <p>If we decide to move forward together, we’ll send you an offer letter, agree on a start date, and guide you through joining XiteAI.</p>
          </li>
        </ol>
        <figure className="careers-process-art">
          <img src={interviewProcessArt} alt="Two people discussing a candidate profile during an interview" loading="lazy" />
        </figure>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
