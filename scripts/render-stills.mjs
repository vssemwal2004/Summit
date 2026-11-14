// Re-generate the artist's-impression stills in design/renders from the 3D concept model.
//
// 1. npm i -D playwright-core          (one-time; uses your installed Microsoft Edge)
// 2. npx next dev -p 3001              (the /render page only exists in development)
// 3. node scripts/render-stills.mjs [scale=1] [shot,shot|all]
//
// Shots and camera positions live in components/three/RenderStudio.tsx.
import { chromium } from "playwright-core";

const out = "design/renders"; // not deployed — CGI concepts for internal review only
const scale = Number(process.argv[2] ?? 1);
const only = process.argv[3] && process.argv[3] !== "all" ? process.argv[3].split(",") : null;

const SIZES = {
  "exterior-dusk": [2400, 1350],
  "exterior-day": [2400, 1350],
  "retail-street": [1600, 2000],
  terrace: [2400, 1200],
  night: [2400, 1350],
  "interior-living": [2520, 1080],
  lobby: [1600, 2000],
  dining: [2000, 1500],
  lounge: [2000, 1500],
};

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11"],
});

for (const [shot, [w, h]] of Object.entries(SIZES)) {
  if (only && !only.includes(shot)) continue;
  const page = await browser.newPage({ viewport: { width: Math.round(w * scale), height: Math.round(h * scale) }, deviceScaleFactor: 1 });
  const t0 = Date.now();
  await page.goto(`http://localhost:3001/render?shot=${shot}`, { waitUntil: "load", timeout: 180000 });
  await page.waitForFunction(() => window.__renderReady === true, null, { timeout: 600000, polling: 500 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${shot}.jpg`, type: "jpeg", quality: 90 });
  console.log(shot, `${Date.now() - t0}ms`);
  await page.close();
}
await browser.close();
