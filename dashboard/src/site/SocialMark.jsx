/* The networks' marks, in their own official shapes, solid, in the current
   text colour, on a 24-unit grid. One colour for all six keeps the row calm;
   the shapes are what make each one recognisable. If an official file is
   ever preferred, give the network a `logo` path in content.js `socials` and
   this draws that file instead. */

const MARKS = {
  LinkedIn: (
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  ),
  X: (
    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.6l5.24 6.93zM17.61 20.64h2.04L6.49 3.24H4.3z" />
  ),
  Instagram: (
    <path fillRule="evenodd" d="M7 1.5h10A5.5 5.5 0 0 1 22.5 7v10a5.5 5.5 0 0 1-5.5 5.5H7A5.5 5.5 0 0 1 1.5 17V7A5.5 5.5 0 0 1 7 1.5zm0 2A3.5 3.5 0 0 0 3.5 7v10A3.5 3.5 0 0 0 7 20.5h10a3.5 3.5 0 0 0 3.5-3.5V7A3.5 3.5 0 0 0 17 3.5zm5 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 2a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zM17.6 5.1a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6z" />
  ),
  Threads: (
    <path fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"
      d="M17.8 7.4C16.6 4.9 14.6 3.6 12 3.6c-4.6 0-7.6 3.3-7.6 8.4s3 8.4 7.6 8.4c3.9 0 6.7-2.1 6.7-5.3 0-2.8-2.1-4.4-5.2-4.4-2.5 0-4.1 1.3-4.1 3 0 1.6 1.4 2.6 3.1 2.6 2.8 0 4.1-2.2 3.9-6.1" />
  ),
  Facebook: (
    <path d="M9.1 23.69v-7.98H6.63v-3.67H9.1v-1.58c0-4.09 1.85-5.98 5.86-5.98.4 0 .96.04 1.47.1.38.04.76.11 1.14.2v3.32c-.22-.02-.44-.03-.65-.04-.25 0-.49-.01-.73-.01-.71 0-1.26.1-1.68.31-.28.14-.52.36-.68.62-.26.42-.37 1-.37 1.75v1.3h3.92l-.39 2.1-.29 1.57h-3.25v8.24C19.4 23.24 24 18.18 24 12.04c0-6.63-5.37-12-12-12S0 5.42 0 12.04c0 5.63 3.87 10.35 9.1 11.65z" />
  ),
  "Product Hunt": (
    <path fillRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm1.6 14.4h-3.4V18H7.8V6h5.8a4.2 4.2 0 0 1 0 8.4zm0-6h-3.4V12h3.4a1.8 1.8 0 0 0 0-3.6z" />
  ),
};

export default function SocialMark({ social, size = 20 }) {
  if (social.logo) return <img src={social.logo} alt="" width={size} height={size} className="sm" />;
  return (
    <svg className="sm" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {MARKS[social.name]}
    </svg>
  );
}
