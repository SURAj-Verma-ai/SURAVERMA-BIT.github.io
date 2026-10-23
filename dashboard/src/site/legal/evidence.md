# Legal content evidence and release decisions

Reviewed 6 October 2026. These are implementation notes, not a claim of counsel approval or a public compliance certification. XOS1 source reviewed read-only at `C:/Users/SURAJ/XOS1/XOS1-CORE/XOS1 V17`.

## Verified behavior

| Fact | Source |
| --- | --- |
| XOS1 AI requests use the company gateway, not a direct customer provider key | XOS1 `core/ai/gateway.py`, Terminal `server/features/gateway/routes.py` |
| Reviewed gateway relays request/response bodies without adding a conversation-log archive | Terminal `server/features/gateway/routes.py`, `upstream.py` |
| DeepInfra is the current allowlisted gateway provider | Terminal `server/features/ai_keys/service.py`; XOS1 `core/ai/interference/Talker/xos1_talker_interference.py` |
| Workspace file text can enter cloud context, even from an open document | XOS1 `core/web/bridge.py`, `_ambient_context_snippet`, around lines 5035–5100 |
| Basic check-ins include IDs, version/build, platform, time zone, language, update state and crash count | XOS1 `core/system/checkin/payload.py` |
| Profile and usage sharing default off; turning profile off clears current name/DOB on next check-in | XOS1 payload; Terminal `server/features/checkin/ingest.py` |
| Usage withdrawal does not delete older `checkins.tools_json` rows | Terminal `server/features/checkin/ingest.py` |
| Support submissions store the submitted details and IP | `server/features/public/routes.py` |
| Account sessions record user agent/IP; access and privileged actions have audit records | `server/security/sessions.py`, `server/core/audit.py` |
| Download counts include hashed IP, time, optional country header and referrer | `server/web/pages.py`, `download` |
| Factory reset clears many local app records, memories and templates; not secure disk erasure | XOS1 `run_lite.py`, `clear_all_memory_and_data` |
| Voice onboarding silently creates templates; no separate biometric opt-in was found | XOS1 `introduction/identity_enroll.py`, `intro_ai.py` |
| Voice-state interpretation is active; separate Emotional Presence/Pulse defaults differ | XOS1 `XOS1readme.md`, voice/Pulse sections; further settings validation needed |
| Cookies, browser preferences, application drafts, update recovery state | `auth/routes.py`, `join/routes.py`, `lib/product.jsx`, `useDraft.js`, `Shell.jsx`, `Code.jsx`, `UpdateNotice.jsx` |

## Founder-confirmed decisions

- Reconfirmed 24 October 2026: XiteAI is an unregistered startup. Public branding describes an early-stage startup; no corporate suffix or registration identifier is claimed. The founder requested removal of the Amity address and affiliation. Only Noida, India remains as the public location; contact inboxes are in `site/content.js`.
- USD/INR; taxes shown at checkout.
- No voluntary-cancellation refunds except mandatory rights; all verified duplicate/error charges refunded.
- Paid-service discontinuation refunds 100/75/50/25 percent by elapsed quarters of **every** billing period.
- No model-training permission; zero-retention requirements are planned, not an account-controls verification.
- Superseded 13 October 2026: the founder confirms XOS1 is designed for all ages. Under-13 users have age-appropriate AI boundaries and optional parental activity controls in the intended design; users aged 13–17 have age-appropriate boundaries without parental activity monitoring; at 18 the intended automatic birthday transition selects the adult execution configuration. This changes product copy, not employee/candidate eligibility or current desktop enforcement.
- XOS1 launches in beta, followed by an intended production release. The founder sets a production-quality ambition; no independent quality certification or transition date is claimed in customer copy.
- Initial beta markets are India and the United States only. The UK and worldwide availability are not included. This is confirmed launch wording, not evidence of checkout or gateway country enforcement.
- Initial sales are B2C; team and customised enterprise plans are future offerings.
- Monthly individual USD prices before applicable tax: Premium $20, Ultra $60, Max $350. A flat $3 tax has not been adopted; actual tax requires location-specific checkout treatment. INR prices are undecided.
- Founder authorised a trial-duration and device-policy recommendation: 14-day Premium trial, unrestricted installation on compatible devices, two active devices for one individual, shared account usage. Trial conversion/card requirements and enforcement remain unresolved.
- Founder confirms DeepInfra is development/testing only, and is evaluating Cerebras and Groq for production. The reviewed gateway allowlist is not proof of the final customer release. “Typesafe AI for jev” needs an exact service identity.
- Founder approves optional biometric recognition with activation/deactivation/deletion controls. This is intended release behavior, not verification that existing silent onboarding has been fixed. Templates stay local; a recognised name/label can enter AI context.

## Questions still awaiting answers

- Actual customer release/provider configuration versus this checkout; implementation of the confirmed India/US launch availability controls.
- Plan/device/usage limits, support hours and targets, refund initiation timing, enterprise SLAs.
- Retention periods for install/check-in records, tickets, applications, security logs and backups.
- Infrastructure/CDN/payment providers and analytics configured outside this repo.
- Biometric opt-in and withdrawal controls before launch. Do not publish a compliant opt-in claim until implemented and verified.
- Output rights/commercial use, brand permissions, and whether the README's two-free-years pledge is intended as a contract commitment.
- Verification and implementation of the age-specific model configuration, under-13 parental access/visibility, guardian consent, and automatic transitions at 13 and 18 before making those controls available in a customer release. The founder confirmed the adult transition at 18; the age-13 removal of parental controls is implied by the under-13/13–17 design and needs an explicit implementation check.

`drafts.js` holds three working policies outside the publication manifest. Do not publish them until their `pending` items are resolved. Pricing and device recommendations do not implement billing, device activation limits or trial controls.

## Primary external references

- DeepInfra inference privacy and feature/model exceptions: https://docs.deepinfra.com/account/data-privacy
- DeepInfra privacy notice: https://deepinfra.com/privacy
- Groq data controls, if later activated: https://console.groq.com/docs/your-data
- Cerebras content retention, if later activated: https://support.cerebras.net/articles/1811589793-does-cerebras-retain-my-data
- UK storage/access guidance: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/
- India DPDP rules/commencement publications: https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa
- FTC COPPA notice/consent guidance: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- India DPDP notification and phased compliance summary: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014
- Consumer-rights exclusions in digital-content contracts: https://www.gov.uk/unfair-terms-in-sales-contracts/implied-rights

`published.json` is the shared publication manifest for the legal hub, routes/tests, previous/next navigation and server sitemap. A routed page is not evidence that unanswered decisions or release readiness checks are complete.

## Age design review — 13 October 2026

Read-only source: `C:/Users/SURAJ/XOS1/XOS1-CORE/XOS1 V17/oldreferencefrontend/practicelinefor designkira/stephen_onboarding_v3.html`.

- Lines 20–21 and 625–628 describe an under-18 onboarding branch, a guardian acknowledgement and the intended minor profile flag. `TERMS_MINOR` at line 595 says some features remain off until eighteen. Minor-specific persona-question wording follows at lines 653, 673, 693 and 713.
- This file is a reference frontend, with adult/minor lab states. Its existence does not verify live age-specific model enforcement or verifiable guardian consent.
- A targeted search of the live Python/JS/HTML source, excluding user records and old reference files, did not locate the promised under-13 parental dashboard, its access controls or an automatic adult-configuration switch. The provider calculates a user age from DOB for context; that is not proof of a configuration transition.
- Website eligibility and the three age bands now share `site/agePolicy.js`. FAQ, Terms, Privacy and Minors Policy use it. The controls and automatic transition are labelled intended and unverified, rather than represented as shipped safeguards.
- Product parental monitoring thresholds are separate from legal consent obligations. The FTC describes consent requirements for covered under-13 processing; India's notified framework has different child-data requirements and phased commencement. No global compliance certification or unconditional monitoring permission is claimed.

## Related legal-document review — 13 October 2026

- Extended the all-age design across Privacy, Terms, Minors, Beta, Acceptable Use, Cookie, AI Disclaimer, Security, Support and Data Deletion. Metadata dates reflect this review. Existing unpublished Biometrics and Third-Party Disclosure drafts remain outside the publication manifest.
- Guardian consent, optional activity visibility, biometric enrolment, website-storage preferences and billing authorisation are separate decisions. Guardian requests require verification of identity and legal authority; payment alone does not authorise conversation access.
- Age-based configuration must not silently enable optional processing, expand device permissions or charge for a new plan. The intended end of under-13 activity access at 13 requires actual revocation. Neither a birthday nor a local reset promises deletion of remote records.
- Child-specific biometric, inference, provider and parental-access features require release and jurisdiction review before activation. A guardian's consent does not override prohibited processing. New guardian/child records need documented purposes, minimisation, retention and deletion; no implemented dashboard, consent provider or retention period was invented.
- Removed the Privacy statement treating continued use as acceptance of new processing and the unverified Settings-withdrawal claim for emotion inference. Corrected Terms' permanent factory-reset erasure claim to match the documented reset scope and external-backup limitations.
- Checked FTC COPPA guidance and its Rule library (https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa) and the PIB phased DPDP notification linked above. These edits are draft product notices, not a compliance certification or proof of implementation. Release-specific legal review remains necessary, including the amended COPPA Rule and provisions in force at launch.
