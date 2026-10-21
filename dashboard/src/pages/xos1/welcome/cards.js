/* The things that fill the Spatial welcome, drawn once each to a canvas: the
   everyday work of a computer, every one of them something XOS1 does by voice
   (weather, markets, maps, slides, notes, calendar, focus, media, news, chess,
   documents, sheets, files, PC health, volume and brightness, alarms).

   Each returns [width, height] in world units and draws itself at 512 px per
   unit of height. Nothing here is a screenshot of anything; it is all drawn. */

const SANS = 'Inter, "Segoe UI", sans-serif';
const SERIF = 'Newsreader, Georgia, serif';
const INK = "#16140f", MUTED = "#8a847b", LINE = "#ece8e1";

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
const text = (ctx, s, x, y, size, color = INK, weight = 500, font = SANS, align = "left") => {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(s, x, y);
};
const label = (ctx, s, W) => { text(ctx, s, 44, 74, 26, MUTED, 500); void W; };

export const CARDS = {
  weather: { size: [1.5, 1.05], draw(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#5d7fa3"); g.addColorStop(1, "#8fa9c4");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    text(ctx, "Mumbai", 44, 74, 28, "rgba(255,255,255,.85)");
    text(ctx, "24°", 40, 210, 140, "#fff", 300);
    text(ctx, "Rain from nine till noon", 44, 268, 28, "rgba(255,255,255,.9)");
    const pct = [8, 14, 72, 88, 81, 64, 12], hrs = ["7", "8", "9", "10", "11", "12", "1"];
    const bw = (W - 88) / pct.length;
    pct.forEach((v, i) => {
      const x = 44 + i * bw, h = (v / 100) * 150;
      ctx.fillStyle = "rgba(255,255,255,.22)"; rr(ctx, x + 10, 330, bw - 20, 150, 10); ctx.fill();
      ctx.fillStyle = v > 50 ? "#ffffff" : "rgba(255,255,255,.55)"; rr(ctx, x + 10, 480 - h, bw - 20, h, 10); ctx.fill();
      text(ctx, hrs[i], x + bw / 2, 515, 22, "rgba(255,255,255,.8)", 500, SANS, "center");
    });
  } },

  stocks: { size: [1.55, 1], draw(ctx, W, H) {
    ctx.fillStyle = "#101a2b"; ctx.fillRect(0, 0, W, H);
    text(ctx, "Portfolio", 44, 74, 26, "rgba(255,255,255,.55)");
    text(ctx, "+0.8%", 40, 180, 96, "#35d39a", 600);
    text(ctx, "₹14,82,300", 44, 226, 30, "rgba(255,255,255,.6)");
    const pts = [0, -0.4, -0.2, 0.3, 0.1, 0.45, 0.38, 0.62, 0.55, 0.8, 0.7, 0.95];
    const x0 = 44, x1 = W - 44, y0 = H - 60, hh = 220;
    ctx.beginPath();
    pts.forEach((v, i) => { const x = x0 + (i / (pts.length - 1)) * (x1 - x0), y = y0 - (v + 0.5) * hh * 0.7; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    const fill = ctx.createLinearGradient(0, y0 - hh, 0, y0);
    fill.addColorStop(0, "rgba(53,211,154,.3)"); fill.addColorStop(1, "rgba(53,211,154,0)");
    ctx.save(); ctx.lineTo(x1, y0); ctx.lineTo(x0, y0); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
    ctx.beginPath();
    pts.forEach((v, i) => { const x = x0 + (i / (pts.length - 1)) * (x1 - x0), y = y0 - (v + 0.5) * hh * 0.7; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = "#35d39a"; ctx.lineWidth = 6; ctx.lineJoin = "round"; ctx.stroke();
  } },

  map: { size: [1.7, 1.1], draw(ctx, W, H) {
    ctx.fillStyle = "#cfe1ee"; ctx.fillRect(0, 0, W, H);
    // A coast, drawn freehand: land on the right, sea on the left.
    ctx.fillStyle = "#efeadf";
    ctx.beginPath(); ctx.moveTo(W * 0.42, 0);
    [[0.5, 0.12], [0.46, 0.25], [0.52, 0.38], [0.47, 0.52], [0.41, 0.63], [0.44, 0.78], [0.38, 0.9], [0.4, 1]].forEach(([x, y]) => ctx.lineTo(W * x, H * y));
    ctx.lineTo(W, H); ctx.lineTo(W, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#d9d2c3"; ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(W * 0.55, H * (0.1 + i * 0.16)); ctx.bezierCurveTo(W * 0.7, H * (0.05 + i * 0.16), W * 0.85, H * (0.2 + i * 0.15), W, H * (0.12 + i * 0.16)); ctx.stroke(); }
    const a = [W * 0.8, H * 0.18], b = [W * 0.45, H * 0.72];
    ctx.setLineDash([16, 14]); ctx.strokeStyle = "#c9743f"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo(W * 0.38, H * 0.25, ...b); ctx.stroke(); ctx.setLineDash([]);
    [a, b].forEach(([x, y]) => { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.fill(); ctx.fillStyle = "#c9743f"; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); });
    text(ctx, "DEL", a[0] + 28, a[1] + 10, 32, INK, 600);
    text(ctx, "BOM", b[0] + 28, b[1] + 10, 32, INK, 600);
    ctx.fillStyle = "rgba(255,255,255,.92)"; rr(ctx, 36, H - 130, 380, 94, 18); ctx.fill();
    text(ctx, "2 h 10 min", 62, H - 74, 34, INK, 600);
    text(ctx, "1,148 km", 250, H - 74, 28, MUTED);
  } },

  photo: { size: [1.4, 1.05], draw(ctx, W, H) {
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    sky.addColorStop(0, "#f2b98a"); sky.addColorStop(1, "#f7dcc0");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff4e4"; ctx.beginPath(); ctx.arc(W * 0.68, H * 0.42, 54, 0, 7); ctx.fill();
    const sea = ctx.createLinearGradient(0, H * 0.58, 0, H);
    sea.addColorStop(0, "#3f7f93"); sea.addColorStop(1, "#1f4e5f");
    ctx.fillStyle = sea; ctx.fillRect(0, H * 0.58, W, H);
    ctx.strokeStyle = "rgba(255,240,220,.5)"; ctx.lineWidth = 3;
    for (let i = 0; i < 9; i++) { const y = H * 0.62 + i * 26; ctx.beginPath(); ctx.moveTo(W * 0.68 - 90 + i * 6, y); ctx.lineTo(W * 0.68 + 90 - i * 6, y); ctx.stroke(); }
    ctx.fillStyle = "#e9d2ae"; ctx.beginPath(); ctx.moveTo(0, H); ctx.quadraticCurveTo(W * 0.3, H * 0.8, W * 0.6, H); ctx.fill();
    ctx.fillStyle = "#24302a";
    ctx.beginPath(); ctx.moveTo(W * 0.12, H); ctx.quadraticCurveTo(W * 0.14, H * 0.6, W * 0.2, H * 0.36); ctx.lineTo(W * 0.21, H * 0.37); ctx.quadraticCurveTo(W * 0.16, H * 0.6, W * 0.15, H); ctx.fill();
    for (let i = 0; i < 7; i++) { ctx.save(); ctx.translate(W * 0.205, H * 0.36); ctx.rotate(-2.6 + i * 0.75); ctx.beginPath(); ctx.ellipse(70, 0, 80, 14, 0.2, 0, 7); ctx.fill(); ctx.restore(); }
  } },

  slide: { size: [1.6, 0.9], draw(ctx, W, H) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#1d2a44"; ctx.fillRect(0, 0, 22, H);
    text(ctx, "Where we are", 70, 120, 58, INK, 600);
    text(ctx, "Three markets, one quarter", 72, 170, 28, MUTED);
    const v = [0.42, 0.64, 0.5, 0.86];
    v.forEach((x, i) => {
      const bx = 72 + i * 150, h = x * 230;
      ctx.fillStyle = i === 3 ? "#c9743f" : "#1d2a44"; rr(ctx, bx, H - 60 - h, 100, h, 8); ctx.fill();
    });
    text(ctx, "+41%", W - 300, H - 150, 84, "#c9743f", 600);
    text(ctx, "year on year", W - 296, H - 100, 26, MUTED);
  } },

  note: { size: [1, 1], draw(ctx, W, H) {
    ctx.fillStyle = "#fbe7a1"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,.05)"; ctx.fillRect(0, 0, W, 60);
    text(ctx, "Tonight", 50, 150, 52, "#3a3220", 600, SERIF);
    ["Pick up Rohan, 9 PM", "Call Mum back", "Buy the umbrella"].forEach((s, i) => {
      ctx.strokeStyle = "#3a3220"; ctx.lineWidth = 3; ctx.strokeRect(54, 212 + i * 82, 26, 26);
      if (i === 1) { ctx.beginPath(); ctx.moveTo(58, 226 + i * 82); ctx.lineTo(66, 234 + i * 82); ctx.lineTo(78, 214 + i * 82); ctx.stroke(); }
      text(ctx, s, 100, 236 + i * 82, 32, "#3a3220", 500);
    });
  } },

  calendar: { size: [1.05, 1.1], draw(ctx, W, H) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#d9483b"; ctx.fillRect(0, 0, W, 110);
    text(ctx, "Saturday", W / 2, 72, 34, "#fff", 600, SANS, "center");
    text(ctx, "14", W / 2, 330, 200, INK, 300, SANS, "center");
    ctx.fillStyle = "#f4efe6"; rr(ctx, 44, 390, W - 88, 110, 16); ctx.fill();
    ctx.fillStyle = "#d9483b"; ctx.fillRect(44, 390, 8, 110);
    text(ctx, "Dinner with Aai", 74, 438, 30, INK, 600);
    text(ctx, "8:00 PM", 74, 478, 26, MUTED);
  } },

  focus: { size: [1, 1], draw(ctx, W, H) {
    ctx.fillStyle = "#1c1b19"; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2 - 10, r = 170;
    ctx.lineWidth = 16; ctx.strokeStyle = "rgba(255,255,255,.1)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    ctx.strokeStyle = "#f0a35e"; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.62); ctx.stroke();
    text(ctx, "18:42", cx, cy + 26, 84, "#fff", 500, SANS, "center");
    text(ctx, "Focus", cx, cy + 74, 28, "rgba(255,255,255,.55)", 500, SANS, "center");
  } },

  music: { size: [1.05, 1.3], draw(ctx, W, H) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    const s = W - 88;
    const g = ctx.createLinearGradient(44, 44, 44 + s, 44 + s);
    g.addColorStop(0, "#2d3a6b"); g.addColorStop(0.55, "#a2475c"); g.addColorStop(1, "#f0a35e");
    ctx.fillStyle = g; rr(ctx, 44, 44, s, s, 18); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(44 + s * 0.5, 44 + s * 0.5, 30 + i * 22, 0, 7); ctx.stroke(); }
    text(ctx, "Monsoon Hours", 44, s + 104, 36, INK, 600);
    text(ctx, "The Low Tides", 44, s + 146, 26, MUTED);
    ctx.fillStyle = LINE; rr(ctx, 44, s + 178, s, 8, 4); ctx.fill();
    ctx.fillStyle = INK; rr(ctx, 44, s + 178, s * 0.38, 8, 4); ctx.fill();
  } },

  news: { size: [1.25, 1.35], draw(ctx, W, H) {
    ctx.fillStyle = "#fffdf8"; ctx.fillRect(0, 0, W, H);
    text(ctx, "Today", 44, 74, 26, MUTED);
    const g = ctx.createLinearGradient(0, 100, 0, 380);
    g.addColorStop(0, "#c9d6c1"); g.addColorStop(1, "#7f9a86");
    ctx.fillStyle = g; rr(ctx, 44, 100, W - 88, 280, 14); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.moveTo(44, 380); ctx.lineTo(W * 0.4, 230); ctx.lineTo(W * 0.62, 320); ctx.lineTo(W * 0.8, 200); ctx.lineTo(W - 44, 300); ctx.lineTo(W - 44, 380); ctx.fill();
    text(ctx, "Monsoon arrives early", 44, 446, 44, INK, 600, SERIF);
    text(ctx, "across the west coast", 44, 496, 44, INK, 600, SERIF);
    [0.9, 0.84, 0.6].forEach((w, i) => { ctx.fillStyle = LINE; rr(ctx, 44, 540 + i * 34, (W - 88) * w, 14, 7); ctx.fill(); });
  } },

  chess: { size: [1.1, 1.1], draw(ctx, W, H) {
    const pad = 30, s = (W - pad * 2) / 8;
    ctx.fillStyle = "#3b2b1f"; ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      ctx.fillStyle = (r + c) % 2 ? "#b58863" : "#f0d9b5";
      ctx.fillRect(pad + c * s, pad + r * s, s, s);
    }
    const P = { "0,4": "♚", "0,3": "♛", "1,4": "♟", "1,5": "♟", "2,2": "♞", "3,3": "♟", "4,4": "♙", "5,5": "♘", "6,3": "♙", "6,6": "♙", "7,4": "♔", "7,3": "♕", "7,0": "♖", "2,6": "♝" };
    Object.entries(P).forEach(([k, g]) => {
      const [r, c] = k.split(",").map(Number);
      text(ctx, g, pad + c * s + s / 2, pad + r * s + s * 0.8, s * 0.82, "#1a1410", 400, '"Segoe UI Symbol", "Noto Sans Symbols 2", serif', "center");
    });
  } },

  doc: { size: [0.95, 1.3], draw(ctx, W, H) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#c0392b"; ctx.fillRect(0, 0, W, 16);
    text(ctx, "Lease agreement", 50, 110, 40, INK, 600, SERIF);
    text(ctx, "PDF · 6 pages", 52, 152, 24, MUTED);
    for (let i = 0; i < 13; i++) { ctx.fillStyle = i === 5 ? "rgba(201,116,63,.28)" : LINE; rr(ctx, 50, 200 + i * 36, (W - 100) * (i % 4 === 3 ? 0.6 : 0.96), 14, 7); ctx.fill(); }
  } },

  sheet: { size: [1.5, 1], draw(ctx, W, H) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#1d6f42"; ctx.fillRect(0, 0, W, 70);
    text(ctx, "Budget 2026.xlsx", 36, 46, 28, "#fff", 600);
    const cols = 5, rows = 8, cw = (W - 40) / cols, rh = (H - 100) / rows;
    const vals = ["Rent", "28,000", "28,000", "28,000", "84,000", "Food", "9,400", "11,200", "8,900", "29,500", "Travel", "4,000", "18,600", "2,100", "24,700"];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = 20 + c * cw, y = 90 + r * rh;
      ctx.strokeStyle = LINE; ctx.lineWidth = 2; ctx.strokeRect(x, y, cw, rh);
      const v = r > 0 && r < 4 ? vals[(r - 1) * 5 + c] : r === 0 ? ["", "Jul", "Aug", "Sep", "Total"][c] : "";
      if (v) text(ctx, v, c ? x + cw - 14 : x + 14, y + rh * 0.66, 24, r === 0 ? MUTED : INK, c === 4 ? 600 : 500, SANS, c ? "right" : "left");
    }
  } },

  files: { size: [1.45, 1.05], draw(ctx, W, H) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    label(ctx, "Documents › College", W);
    const names = ["Thesis final", "Lab report", "Resume", "Scans", "Photos", "Invoices"];
    names.forEach((n, i) => {
      const x = 44 + (i % 3) * ((W - 88) / 3), y = 120 + Math.floor(i / 3) * 220;
      const folder = i >= 3;
      if (folder) {
        ctx.fillStyle = "#f2c35b"; rr(ctx, x + 20, y + 20, 150, 110, 12); ctx.fill();
        ctx.fillStyle = "#e5b142"; rr(ctx, x + 20, y + 8, 64, 30, 8); ctx.fill();
      } else {
        ctx.fillStyle = ["#2f5ea8", "#c0392b", "#2f5ea8"][i]; rr(ctx, x + 50, y + 4, 96, 126, 10); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.8)"; for (let k = 0; k < 4; k++) ctx.fillRect(x + 66, y + 34 + k * 20, 64 - (k % 2) * 20, 6);
      }
      text(ctx, n, x + 96, y + 172, 24, INK, 500, SANS, "center");
    });
  } },

  health: { size: [1.35, 1], draw(ctx, W, H) {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    label(ctx, "This PC", W);
    [["Memory", 0.72, "#c9743f", "11.5 of 16 GB"], ["Disk", 0.48, "#2f5ea8", "238 GB free"], ["Battery", 0.86, "#0f8a5f", "86%"], ["Temperature", 0.4, "#8a847b", "52 °C"]].forEach(([n, v, c, s], i) => {
      const y = 140 + i * 100;
      text(ctx, n, 44, y, 30, INK, 600);
      text(ctx, s, W - 44, y, 26, MUTED, 500, SANS, "right");
      ctx.fillStyle = LINE; rr(ctx, 44, y + 22, W - 88, 14, 7); ctx.fill();
      ctx.fillStyle = c; rr(ctx, 44, y + 22, (W - 88) * v, 14, 7); ctx.fill();
    });
  } },

  sound: { size: [1.3, 0.62], draw(ctx, W, H) {
    ctx.fillStyle = "#26241f"; ctx.fillRect(0, 0, W, H);
    [["Volume", 0.35], ["Brightness", 0.7]].forEach(([n, v], i) => {
      const y = 100 + i * 130;
      text(ctx, n, 44, y, 28, "rgba(255,255,255,.7)", 500);
      ctx.fillStyle = "rgba(255,255,255,.14)"; rr(ctx, 44, y + 26, W - 88, 18, 9); ctx.fill();
      ctx.fillStyle = "#fff"; rr(ctx, 44, y + 26, (W - 88) * v, 18, 9); ctx.fill();
      ctx.beginPath(); ctx.arc(44 + (W - 88) * v, y + 35, 22, 0, 7); ctx.fill();
    });
  } },

  alarm: { size: [1.2, 0.72], draw(ctx, W, H) {
    ctx.fillStyle = "#23262f"; ctx.fillRect(0, 0, W, H);
    text(ctx, "Alarm", 44, 74, 26, "rgba(255,255,255,.55)");
    text(ctx, "6:30", 40, 250, 160, "#fff", 300);
    text(ctx, "AM", 400, 250, 48, MUTED, 500);
    ctx.fillStyle = "#0f8a5f"; rr(ctx, W - 160, 180, 112, 64, 32); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(W - 80, 212, 26, 0, 7); ctx.fill();
    text(ctx, "Weekdays", 44, H - 50, 28, "rgba(255,255,255,.55)");
  } },
};

/** Draw one card to a canvas texture. */
export function cardTexture(THREE, key, anisotropy = 8) {
  const card = CARDS[key];
  const [w, h] = card.size;
  const S = 512;
  const cv = document.createElement("canvas");
  cv.width = Math.round(w * S); cv.height = Math.round(h * S);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  const paint = () => { const ctx = cv.getContext("2d"); ctx.clearRect(0, 0, cv.width, cv.height); card.draw(ctx, cv.width, cv.height); tex.needsUpdate = true; };
  paint();
  return { tex, w, h, paint };
}
