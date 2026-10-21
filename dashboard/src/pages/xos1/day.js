/* One day with XOS1, scene by scene. Scrolling through the page is the day
   passing: each scene is an hour, a thing you say, what XOS1 says back, and
   the thing it actually does, shown on the page.

   Written for this page, not lifted from the README, and every one of them is
   something the shipped build (v1.0.17) really does: weather and its hourly
   outlook, a portfolio valued live with its news, typo-proof file search and
   PowerPoint opened as the real deck, the slowdown finder, the focus timer
   teleported to you, recall of something said earlier with its time, and
   screen brightness. Nothing here needs a feature that is switched off or
   still being built. No em dashes. */

export const DAY = [
  {
    id: "rain", time: [6, 40], light: "dawn",
    you: "What's the weather like?",
    her: "Rain from nine till noon. Take the umbrella.",
  },
  {
    id: "stocks", time: [9, 15], light: "morning",
    you: "How did my stocks open?",
    her: "Up 0.8%. The banks are carrying it; there was rate news this morning.",
  },
  {
    id: "deck", time: [11, 30], light: "noon",
    you: "Open my pich deck.",
    typo: "pich",
    her: "Here it is. Twelve slides, exactly as you made them.",
  },
  {
    id: "slow", time: [14, 0], light: "day",
    you: "Why is my laptop so slow?",
    her: "Chrome has 31 tabs open. And you haven't restarted in 19 days.",
  },
  {
    id: "focus", time: [16, 0], light: "afternoon",
    you: "Start a focus session.",
    her: "Twenty-five minutes. I'll keep quiet.",
  },
  {
    id: "recall", time: [20, 30], light: "evening",
    you: "What did I say I had to do tonight?",
    her: "Pick up Rohan. His flight lands at nine; you told me this morning.",
    earlier: { time: "8:02 AM", said: "Rohan lands at nine tonight." },
  },
  {
    id: "dim", time: [23, 10], light: "night",
    you: "Dim it. I'm going to sleep.",
    her: "Goodnight.",
  },
];

/* The page's light at each scene, in order: background, then ink. The day
   starts on the site's own warm paper, whitens toward noon, and ends black. */
export const LIGHT = {
  dawn: ["#ebe2d5", "#1a1714"],
  morning: ["#f4efe7", "#1a1714"],
  noon: ["#fbfaf8", "#111111"],
  day: ["#ffffff", "#111111"],
  afternoon: ["#f3ece2", "#1a1714"],
  evening: ["#17140f", "#f2ede6"],
  night: ["#030303", "#f5f5f5"],
};

export const fmtTime = (h, m) => {
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
