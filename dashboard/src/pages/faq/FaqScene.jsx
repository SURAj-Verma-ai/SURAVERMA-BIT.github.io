import { Ink, LineScene } from "../../site/LineScene.jsx";

// A question and a written answer, connected by a single drawn line.
export default function FaqScene() {
  return <LineScene className="fq-scene" viewBox="0 0 640 430">
    <g className="ls-wash">
      <path className="ls-paper" d="M367 87H481L521 127V324H367Z" />
      <path className="ls-shadow" d="M359 324H521L536 337H374Z" />
      <circle cx="210" cy="277" r="10" className="ls-warm" />
    </g>
    <Ink d="M89 361H552M123 361V343M527 361V343" className="ls-soft" />
    <Ink d="M140 151c0-43 26-73 72-73 42 0 69 24 69 58 0 25-14 41-38 59-26 19-33 31-33 52" className="ls-accent" />
    <Ink d="M151 151c0-36 23-62 61-62 34 0 57 19 57 47 0 22-14 35-37 52-26 20-33 36-33 59" className="ls-soft" delay={.12} />
    <Ink d="M220 277a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" className="ls-accent" delay={.4} />
    <Ink d="M367 87H481L521 127V324H367V87ZM481 87V127H521" delay={.3} />
    <Ink d="M396 155H457M396 184H490M396 211H478M396 238H465M396 280H437" className="ls-soft" delay={.7} />
    <Ink d="M210 305V325H319V211H367" className="ls-accent" delay={.65} />
    <Ink d="M379 74H488L534 120V313M333 211H354" className="ls-soft" delay={.9} />
  </LineScene>;
}
