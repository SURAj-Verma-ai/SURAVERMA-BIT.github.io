export function sortPosts(posts, kind) {
  return posts.filter(p => p.kind === kind && p.status !== "draft" && Number.isFinite(Date.parse(p.publishedAt)))
    .slice().sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
}

export function latestPosts(posts, kind, limit=4) {
  return sortPosts(posts,kind).slice(0,limit);
}

export function postDate(value) {
  return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(value));
}
