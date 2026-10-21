// Founder-confirmed product design, 13 October 2026. These thresholds describe
// intended XOS1 behaviour; they do not implement age checks or parental access.
export const productAgePolicy = {
  minimumAge:null,
  parentalControlsBelow:13,
  adultModeFrom:18,
};

export const productAgeEligibility = "XOS1 is designed for people of all ages, with an age-appropriate experience.";
export const ageControlsReleaseStatus = "Age-specific model boundaries, parental controls and automatic adult-mode switching are part of the intended product design. Their implementation has not yet been verified in a customer release.";
export const adultTransition = "The intended design uses the recorded date of birth to switch automatically to the adult configuration when the user turns 18. That configuration continues to follow permissions, privacy settings and the Terms of Service.";
export const consentAndControls = "Parental controls and parental consent are separate. Where applicable law requires parent or guardian consent for a child’s personal information, that consent must be obtained before the relevant processing. The absence of parental monitoring for an age band does not remove a legal consent requirement.";
export const guardianAccess = "A parent or guardian may request access, correction or deletion of a child’s company-held information, or withdraw consent, where applicable law gives them that authority. We must verify the requester’s identity and authority before disclosing information or acting on their behalf. Paying for an account does not by itself grant access to its conversations.";
export const ageDataUse = "The intended age-based experience uses the recorded date of birth to choose the appropriate configuration and recognise age transitions. Optional profile sharing with XiteAI is a separate setting; it is not a verified age-check or guardian-consent process. A release must explain whether age and guardian information stays on the device or is sent to XiteAI or a verification provider, and collect only what is needed for the stated purpose.";
export const ageTransitionLimits = "An age transition must not automatically enable a camera, enrol biometrics, expand file permissions, turn on optional reporting, authorise a new payment or provide consent for a new use of personal information. A birthday does not automatically erase existing records; their retention and deletion remain subject to the Privacy Policy.";

export const productAgeBands = [
  {id:"under-13",label:"Under 13",description:"Age-appropriate AI with respectful boundaries. The intended design includes optional parental controls; when enabled, they are intended to give a parent or guardian visibility into the child’s XOS1 activity."},
  {id:"teen",label:"13–17",description:"Age-appropriate AI with respectful boundaries. The intended design does not include parental activity-monitoring controls for this age band."},
  {id:"adult",label:"18 and over",description:"The full adult configuration, with its broader execution capabilities. The transition is intended to happen automatically when the recorded age reaches 18."},
];

export const productAgeSummary = [productAgeEligibility,...productAgeBands.map(band => `${band.label}: ${band.description}`),ageControlsReleaseStatus];
