import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { clearOptionalPreferences, readPrivacyChoice, savePrivacyChoice } from "./privacyChoice.js";
import "./site.css";
import "./PrivacyChoices.css";

export default function PrivacyChoices() {
  const [choice,setChoice] = useState(readPrivacyChoice);
  const [preferences,setPreferences] = useState(Boolean(choice?.preferences));
  const [message,setMessage] = useState("");
  const dialog = useRef(null);
  useEffect(() => {
    const refresh = () => {
      const saved = readPrivacyChoice();
      setChoice(saved);
      if (!saved?.preferences) clearOptionalPreferences();
    };
    const open = () => {
      setPreferences(Boolean(readPrivacyChoice()?.preferences)); setMessage("");
      if (!dialog.current.open) dialog.current.showModal();
    };
    refresh();
    window.addEventListener("xtec-open-privacy",open);
    window.addEventListener("xtec-privacy-change",refresh);
    window.addEventListener("focus",refresh);
    return () => {
      window.removeEventListener("xtec-open-privacy",open);
      window.removeEventListener("xtec-privacy-change",refresh);
      window.removeEventListener("focus",refresh);
    };
  },[]);
  const open = () => {
    setPreferences(Boolean(readPrivacyChoice()?.preferences)); setMessage("");
    dialog.current.showModal();
  };
  const save = allow => {
    const remembered = savePrivacyChoice(allow);
    setChoice(readPrivacyChoice()); setPreferences(allow);
    setMessage(remembered ? "" : "Your choice applies for this visit. Your browser is blocking the storage needed to remember it.");
    if (remembered && dialog.current.open) dialog.current.close();
  };
  return <div className="site pc-surface">
    {(!choice || (message && !dialog.current?.open)) && <section className="pc-banner" aria-labelledby="pc-banner-title"><div className="pc-banner-copy"><h2 id="pc-banner-title">Your privacy choices</h2><p>We use necessary storage to keep the site working. With your permission, we can also remember interface settings. <Link to="/legal/cookie-policy">Cookie Policy</Link></p>{message && <p className="pc-message" role="status">{message}</p>}</div><div className="pc-banner-actions"><button onClick={() => save(false)}>Only necessary</button><button onClick={() => save(true)}>Allow preferences</button><button className="pc-manage" onClick={open}>Manage choices</button>{message && <button className="pc-manage" onClick={() => setMessage("")}>Done</button>}</div></section>}
    <dialog ref={dialog} className="pc-panel" aria-labelledby="pc-title" aria-describedby="pc-intro" data-lenis-prevent onClose={() => { /* Native dialog restores focus to its opener. */ }}>
      <button className="pc-close" onClick={() => dialog.current.close()} aria-label="Close privacy choices">×</button>
      <p className="pc-kicker">XiteAI</p><h2 id="pc-title">Privacy choices</h2><p id="pc-intro">Choose what this website remembers in your browser. You can change your choice here at any time.</p>
      <div className="pc-category"><div><h3>Necessary storage</h3><p>Keeps sign-in and application access working, saves application drafts, and remembers your privacy choice.</p></div><span className="pc-required">Always active</span></div>
      <div className="pc-category"><div><h3 id="pc-preference-label">Remember interface settings</h3><p id="pc-preference-detail">Save your selected product, sidebar layout and code editor preferences between visits.</p></div><label className="pc-toggle"><input type="checkbox" checked={preferences} onChange={e => setPreferences(e.target.checked)} aria-labelledby="pc-preference-label" aria-describedby="pc-preference-detail" /><span aria-hidden="true" /></label></div>
      <p className="pc-no-tracking">The website application has no advertising cookies, third-party analytics scripts or session-recording tools.</p>
      <p className="pc-policy"><Link to="/legal/cookie-policy" onClick={() => dialog.current.close()}>Cookie Policy</Link><Link to="/legal/privacy" onClick={() => dialog.current.close()}>Privacy Policy</Link></p>
      {message && <p className="pc-message" role="status">{message}</p>}
      <div className="pc-panel-actions"><button onClick={() => save(false)}>Only necessary</button><button onClick={() => save(preferences)}>Save choices</button>{message && <button onClick={() => { dialog.current.close(); setMessage(""); }}>Done</button>}</div>
    </dialog>
  </div>;
}
