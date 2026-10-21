export const PRIVACY_COOKIE = "xtec_privacy";
export const PRIVACY_VERSION = 1;
export const CHOICE_MAX_AGE = 180*24*60*60;
export const OPTIONAL_KEYS = ["tc-product","tc-sidebar","tc-code-repo","tc-code-theme"];
let visitChoice = null;

export function parseChoice(value,now=Date.now()) {
  try {
    const record = JSON.parse(value);
    if (record.version !== PRIVACY_VERSION || typeof record.preferences !== "boolean" || !Number.isFinite(record.at) || record.at > now+60000 || now-record.at >= CHOICE_MAX_AGE*1000) return null;
    return record;
  } catch { return null; }
}

export function readPrivacyChoice() {
  if (visitChoice) return parseChoice(JSON.stringify(visitChoice));
  try {
    const value = document.cookie.split(";").map(p => p.trim()).find(p => p.startsWith(`${PRIVACY_COOKIE}=`));
    const record = value ? parseChoice(decodeURIComponent(value.slice(PRIVACY_COOKIE.length+1))) : null;
    return record || (visitChoice ? parseChoice(JSON.stringify(visitChoice)) : null);
  } catch { return visitChoice ? parseChoice(JSON.stringify(visitChoice)) : null; }
}

export function clearOptionalPreferences() {
  for (const key of OPTIONAL_KEYS) { try { localStorage.removeItem(key); } catch { /* Browser storage may be unavailable. */ } }
}

export function savePrivacyChoice(preferences) {
  const record = {version:PRIVACY_VERSION,preferences:Boolean(preferences),at:Date.now()};
  let saved = false;
  try {
    document.cookie = `${PRIVACY_COOKIE}=${encodeURIComponent(JSON.stringify(record))}; Max-Age=${CHOICE_MAX_AGE}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure":""}`;
    const value = document.cookie.split(";").map(p => p.trim()).find(p => p.startsWith(`${PRIVACY_COOKIE}=`));
    const stored = value ? parseChoice(decodeURIComponent(value.slice(PRIVACY_COOKIE.length+1))) : null;
    saved = Boolean(stored && stored.at === record.at && stored.preferences === record.preferences);
  } catch { /* Use the choice for this visit if cookies are blocked. */ }
  visitChoice = saved ? null : record;
  if (!record.preferences) clearOptionalPreferences();
  window.dispatchEvent(new Event("xtec-privacy-change"));
  return saved;
}

export function getPreference(key) {
  if (!OPTIONAL_KEYS.includes(key)) return null;
  if (!readPrivacyChoice()?.preferences) { clearOptionalPreferences(); return null; }
  try { return localStorage.getItem(key); } catch { return null; }
}

export function setPreference(key,value) {
  if (!OPTIONAL_KEYS.includes(key) || !readPrivacyChoice()?.preferences) return;
  try { localStorage.setItem(key,String(value)); } catch { /* A convenience only. */ }
}

export function openPrivacyChoices() {
  window.dispatchEvent(new Event("xtec-open-privacy"));
}
