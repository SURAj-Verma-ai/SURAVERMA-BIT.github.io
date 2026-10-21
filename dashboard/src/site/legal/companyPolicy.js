import { XITEAI_CODE } from "../xiteaiCode.js";

// Published working practices complement the shared Code. Existing agreements
// and approval processes continue to define each person's authority.
export const workingPractices = [
  {id:"options",title:"Bring options with the problem.",text:"Describe what is blocked, what you tried and the alternatives you recommend. If the problem is urgent, report it immediately; finding a complete solution must not delay raising it."},
  {id:"authority",title:"Decide within your authority.",text:"Make decisions within the scope agreed with your manager. Record the reason and keep affected people informed. Spending, access, contracts and commitments still follow their approval process; this page sets no financial limit."},
  {id:"quality",title:"Match the review to the risk.",text:"An internal experiment can be small and unfinished if its limitations are clear. Work reaching customers needs the checks appropriate to its impact. Speed is not a reason to skip privacy, security or required approvals."},
  {id:"repeatable",title:"Write down repeatable work.",text:"When a task becomes a process, document the steps, the owner and how to check the result. Make the record usable by the next person and update it when the work changes."},
  {id:"decisions",title:"Explain the decision.",text:"Updates should say what was decided, why, what happens next and where help is needed. Separate decisions already within your authority from requests that still need approval."},
  {id:"early",title:"Raise problems early.",text:"Tell the person responsible when a customer is unhappy, a deadline is at risk or something could cause harm. State what you know, what remains uncertain and the next useful step. Do not wait for a perfect report."},
  {id:"ownership",title:"Keep ownership clear.",text:"Agree who is responsible for the next step. A handover needs an accepting owner, the relevant information and a clear account of what is unfinished. Asking for help is part of taking responsibility."},
  {id:"mistakes",title:"Own the mistake and help fix it.",text:"Make the issue visible, contain its impact and work on the correction. Record what changed and what should prevent a repeat. Blame, concealment and vague reassurance make the work harder to repair."},
  {id:"questions",title:"Ask when the consequences are unclear.",text:"A familiar decision can be made within an agreed mandate. If its consequences, permissions or effect on other people are uncertain, ask. Disagreement and raising a concern should be treated on their merits, including when the concern is about leadership."},
];

export const companyPolicy = {
  contact:"general",
  sections:[
    {id:"scope",title:"About this document",paragraphs:["The XiteAI Code and our working practices set out how we make decisions, take responsibility and communicate. Employment agreements and approval processes continue to define spending, access and signing authority.","Product and website policies retain their own scope and terms. Leave, pay, benefits and employment procedures are governed by the applicable agreements and policies."]},
    {id:"code",title:"The XiteAI Code",paragraphs:XITEAI_CODE.map(rule => rule.text)},
    {id:"practices",title:"Working practices",paragraphs:["These practices guide our daily work: making decisions within our responsibilities, keeping people informed and raising concerns early."],bullets:workingPractices.map(rule => `${rule.title} ${rule.text}`)},
    {id:"documents",title:"Policy documents",paragraphs:["Read our published policies for information about privacy, security, product use and support."]},
    {id:"questions",title:"Questions and concerns",paragraphs:["Use the published contact routes for a policy question, a privacy request, a security report or a support issue. Report urgent problems before a complete explanation is ready. Do not include passwords or unrelated personal information in a report."],links:[{to:"/legal/privacy",label:"Privacy Policy"},{to:"/legal/security",label:"Security reports"},{to:"/legal/support-policy",label:"Support Policy"}]},
  ],
};
