import test from "node:test";
import assert from "node:assert/strict";
import { parseChoice, CHOICE_MAX_AGE, PRIVACY_VERSION } from "./privacyChoice.js";

test("only current, valid choices can grant optional storage", () => {
  const now = Date.now();
  const valid = {version:PRIVACY_VERSION,preferences:true,at:now};
  assert.equal(parseChoice(JSON.stringify(valid),now).preferences,true);
  assert.equal(parseChoice(JSON.stringify({...valid,at:now-CHOICE_MAX_AGE*1000}),now),null);
  assert.equal(parseChoice(JSON.stringify({...valid,version:0}),now),null);
  assert.equal(parseChoice(JSON.stringify({...valid,preferences:"true"}),now),null);
  assert.equal(parseChoice("broken",now),null);
});

async function browserModel(id,run) {
  const originals = Object.fromEntries(["document","localStorage","location","window"].map(k => [k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const items = new Map([["tc-sidebar","collapsed"],["tc-join-draft","application answers"]]);
  let cookie = "",lastWrite = "",blocked = false;
  const document = {};
  Object.defineProperty(document,"cookie",{get:() => cookie,set:value => {lastWrite=value;if (!blocked) cookie=value.split(";")[0];}});
  Object.defineProperties(globalThis,{
    document:{value:document,configurable:true},location:{value:{protocol:"https:"},configurable:true},window:{value:{dispatchEvent(){}},configurable:true},
    localStorage:{value:{getItem:k => items.get(k) ?? null,setItem:(k,v) => items.set(k,v),removeItem:k => items.delete(k)},configurable:true},
  });
  try { await run(await import(`./privacyChoice.js?case=${id}`),{items,write:() => lastWrite,block:() => {blocked=true;},expire:() => {cookie="";}}); }
  finally { for (const [key,descriptor] of Object.entries(originals)) { if (descriptor) Object.defineProperty(globalThis,key,descriptor); else delete globalThis[key]; } }
}

test("optional storage starts off and withdrawal clears only interface preferences", async () => {
  await browserModel("withdraw",async (choice,model) => {
    assert.equal(choice.getPreference("tc-sidebar"),null);
    assert.equal(model.items.get("tc-join-draft"),"application answers");
    choice.setPreference("tc-code-theme","light");
    assert.equal(model.items.has("tc-code-theme"),false);
    assert.equal(choice.savePrivacyChoice(true),true);
    assert.match(model.write(),/SameSite=Lax/); assert.match(model.write(),/Secure/);
    choice.setPreference("tc-code-theme","light");
    assert.equal(choice.getPreference("tc-code-theme"),"light");
    choice.savePrivacyChoice(false);
    assert.equal(model.items.has("tc-code-theme"),false);
    assert.equal(model.items.get("tc-join-draft"),"application answers");
    choice.setPreference("tc-sidebar","collapsed");
    assert.equal(model.items.has("tc-sidebar"),false);
  });
});

test("expired or deleted choices stop preference access", async () => {
  await browserModel("expire",async (choice,model) => {
    choice.savePrivacyChoice(true); choice.setPreference("tc-code-theme","light");
    model.expire();
    assert.equal(choice.getPreference("tc-code-theme"),null);
    assert.equal(model.items.has("tc-code-theme"),false);
  });
});

test("blocked cookie updates still honour withdrawal during this visit", async () => {
  await browserModel("blocked",async (choice,model) => {
    choice.savePrivacyChoice(true); choice.setPreference("tc-code-theme","light");
    model.block();
    assert.equal(choice.savePrivacyChoice(false),false);
    assert.equal(choice.readPrivacyChoice().preferences,false);
    assert.equal(choice.getPreference("tc-code-theme"),null);
  });
});
