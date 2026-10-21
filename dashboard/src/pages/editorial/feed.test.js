import test from "node:test";
import assert from "node:assert/strict";
import { latestPosts, sortPosts } from "./feed.js";
import { readdirSync, readFileSync } from "node:fs";

test("About takes the four newest entries from the correct feed", () => {
  const rows = [1,5,3,2,4,6].map(day => ({id:`post-${day}`,kind:"news",status:"published",publishedAt:`2026-10-0${day}`}));
  rows.push({id:"blog",kind:"blog",status:"published",publishedAt:"2026-10-12"});
  rows.push({id:"draft",kind:"news",status:"draft",publishedAt:"2026-10-13"});
  assert.deepEqual(latestPosts(rows,"news").map(p => p.id),["post-6","post-5","post-4","post-3"]);
  assert.deepEqual(latestPosts(rows,"blog").map(p => p.id),["blog"]);
});

test("newly added published posts appear first without modifying the About list", () => {
  const posts = [{id:"old",kind:"blog",status:"published",publishedAt:"2026-10-01"}];
  const next = {id:"new",kind:"blog",status:"published",publishedAt:"2026-10-13"};
  assert.equal(latestPosts([...posts,next],"blog")[0].id,"new");
  assert.equal(posts.length,1);
  assert.deepEqual(sortPosts([{id:"bad",kind:"blog",publishedAt:"invalid"}],"blog"),[]);
});

test("the coded News and Blog catalogs are distinct and all dates sort correctly", () => {
  const feeds = {};
  for (const kind of ["news","blog"]) {
    const folder = new URL(`./posts/${kind}/`,import.meta.url);
    feeds[kind] = readdirSync(folder).filter(name => name.endsWith(".json")).map(name => ({...JSON.parse(readFileSync(new URL(name,folder),"utf8")),kind}));
    assert.equal(new Set(feeds[kind].map(p => p.id)).size,feeds[kind].length);
    assert.equal(latestPosts(feeds[kind],kind).length,4);
  }
  assert.ok(feeds.news.every(n => feeds.blog.every(b => n.title !== b.title)));
  assert.ok(feeds.news.every(n => feeds.blog.every(b => n.paragraphs.join() !== b.paragraphs.join())));
});
