import { Link } from "../../site/CanonicalLink.jsx";
import IntentSculpture from "../../components/IntentSculpture.jsx";
import "./Finale.css";

export default function Finale() {
  return <section className="xf" id="xos1-finale" aria-labelledby="xf-title">
    <div className="xf-content">
      <div className="xf-heading">
        <div><p className="xf-eyebrow">XOS1</p><h2 id="xf-title">Your computer.<br /><em>In your words.</em></h2></div>
        <p className="xf-note">Say it.<br />It's done.</p>
      </div>
      <div className="xf-sculpture"><IntentSculpture mode="voice" /></div>
      <div className="xf-bottom">
        <div className="xf-download"><a href="https://xtec.xiteai.com/download">Download XOS1 <span aria-hidden="true">↓</span></a><span>For Windows</span></div>
        <Link className="xf-build" to="/careers"><span>Help build what comes next.</span><span className="xf-build-circle" aria-hidden="true">↗</span></Link>
      </div>
    </div>
  </section>;
}
