import { XITEAI_CODE } from "../xiteaiCode.js";

// Published working practices complement the shared Code. Existing agreements
// and approval processes continue to define each person's authority.
export const workingPractices = [
  {id:"options",title:"Report first; develop options together.",text:"Describe the issue, its possible impact and what is still unknown. Report urgent concerns immediately. Suggest alternatives when you can, but never delay a report to prepare solutions, a ranking or proof. The responsible lead helps evaluate the next steps."},
  {id:"authority",title:"Decide within your authority.",text:"Make decisions within the scope agreed with your manager. Record the reason and keep affected people informed. Spending, access, contracts and commitments still follow their approval process; this page sets no financial limit."},
  {id:"quality",title:"Match the review to the risk.",text:"An internal experiment can be small and unfinished if its limitations are clear. Work reaching customers needs the checks appropriate to its impact. Speed is not a reason to skip privacy, security or required approvals."},
  {id:"repeatable",title:"Write down repeatable work.",text:"When a task becomes a process, document the steps, the owner and how to check the result. Make the record usable by the next person and update it when the work changes."},
  {id:"decisions",title:"Explain the decision.",text:"Updates should say what was decided, why, what happens next and where help is needed. Separate decisions already within your authority from requests that still need approval."},
  {id:"early",title:"Raise problems early.",text:"Report customer harm, security or privacy incidents, legal risks and serious reliability problems immediately to the responsible lead. Uncertainty is a reason to label what is unknown, not to stay silent. Escalate further if an urgent report is not acknowledged."},
  {id:"ownership",title:"Assign ownership and support together.",text:"Reporting a problem does not assign the reporter every recovery task. The manager agrees an accountable owner, supporting people, resources and time, and reprioritises existing work. The owner coordinates the response. A handover needs an accepting owner and a record of unfinished work."},
  {id:"mistakes",title:"Make mistakes visible and repair them together.",text:"Thank the person who reports the issue, contain its impact through the authorised process and share the recovery work. Keep an honest status and record changes; do not conceal patches, obscure failures or blame others without evidence. Review causes and conditions fairly, distinguishing honest mistakes from deliberate misconduct."},
  {id:"questions",title:"Ask when the consequences are unclear.",text:"A familiar decision can be made within an agreed mandate. If its consequences, permissions or effect on other people are uncertain, ask. Disagreement and raising a concern should be treated on their merits, including when the concern is about leadership."},
  {id:"evidence",title:"Match the evidence to the decision.",text:"Use logs, measurements, reproducible failures, documented service limits and engineering judgement. Agree a time limit for investigation and state uncertainty. A mathematical thesis is not required to raise a practical constraint or recommend stopping an unworkable approach."},
  {id:"leadership",title:"Make speaking up safe.",text:"The CEO and managers must welcome bad news, thank good-faith reporters even when their solution is weak, and provide help and follow-up. Humiliation, retaliation or penalties for good-faith reporting, questions or disagreement are prohibited. Recognise useful reporting without exposing confidential information or identifying a reporter without permission. Concerns about a manager can go directly to HR, another responsible leader or the grievance contact."},
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
