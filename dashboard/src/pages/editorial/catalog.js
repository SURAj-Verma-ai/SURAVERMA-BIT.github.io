import { latestPosts, sortPosts } from "./feed.js";

// Adding a JSON file is enough: Vite discovers it during the next site build.
// The archives, articles and About carousels all read this same catalogue.
const files = import.meta.glob("./posts/*/*.json", {eager:true,import:"default"});
const posts = Object.entries(files).map(([path,post]) => ({...post,kind:path.split("/")[2]}));
export const getPosts = kind => sortPosts(posts,kind);
export const getLatestPosts = (kind,limit=4) => latestPosts(posts,kind,limit);
