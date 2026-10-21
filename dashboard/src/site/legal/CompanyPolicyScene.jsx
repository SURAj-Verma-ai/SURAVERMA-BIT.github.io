import { Ink, LineScene } from "../LineScene.jsx";

export default function CompanyPolicyScene() {
  return <LineScene className="company-policy-scene" viewBox="0 0 640 430">
    <g className="ls-wash">
      <path className="ls-paper" d="M113 95H237L270 130V302H113Z" />
      <path className="ls-paper" d="M285 137H409L442 172V344H285Z" />
      <path className="ls-warm" d="M465 69H533V137H465Z" />
    </g>
    <Ink d="M72 375H568M90 375V354M550 375V354" className="ls-soft" />
    <Ink d="M113 95H237L270 130V302H113V95ZM237 95V130H270" />
    <Ink d="M285 137H409L442 172V344H285V137ZM409 137V172H442" delay={.25} />
    <Ink d="M143 153H222M143 177H238M143 201H224M143 225H203M143 268H173M315 194H393M315 218H410M315 242H392M315 266H374M315 308H345" className="ls-soft" delay={.55} />
    <Ink d="M270 232H285M442 240H499V137M465 69H533V137H465V69Z" delay={.65} className="ls-accent" />
    <Ink d="M477 103H521M499 81V125" className="ls-accent" delay={.9} />
    <Ink d="M113 302V327H255M285 344V363H461" className="ls-soft" delay={.8} />
  </LineScene>;
}
