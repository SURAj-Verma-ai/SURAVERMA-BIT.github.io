export default function PostCover({post,loading="lazy",sizes="(max-width:760px) calc(100vw - 48px), (max-width:1050px) 45vw, 440px"}) {
  if (post.cover) return <span className={`ed-cover ed-cover-${post.cover}`} role="img" aria-label={post.alt}>
    {post.cover === "company" ? <img src="/logo/xiteai.png" width="128" height="143" alt="" loading={loading} /> : <span>{post.cover === "xos1" ? "XOS1" : post.cover === "lumen" ? <>Lumen<br />Visuals.</> : <>Build<br />XiteAI.</>}</span>}
  </span>;
  return <img src={post.image} srcSet={post.imageSmall ? `${post.imageSmall} 480w, ${post.image} 1200w` : undefined} sizes={post.imageSmall ? sizes : undefined} alt={post.alt} loading={loading} decoding="async" width="1200" height="780" />;
}
