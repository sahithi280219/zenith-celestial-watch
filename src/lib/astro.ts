// Lightweight astronomy helpers (no external deps).
// Computes sub-solar point, local sidereal time, and zenith RA/Dec for a given lat/lon.

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export function julianDate(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function gmstHours(date: Date) {
  const jd = julianDate(date);
  const d = jd - 2451545.0;
  const t = d / 36525;
  let gmst =
    6.697374558 +
    0.06570982441908 * d +
    1.00273790935 * (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) +
    0.000026 * t * t;
  gmst = ((gmst % 24) + 24) % 24;
  return gmst;
}

export function localSiderealTime(date: Date, lonDeg: number) {
  const lst = gmstHours(date) + lonDeg / 15;
  return ((lst % 24) + 24) % 24;
}

// Sub-solar point approximation
export function subSolarPoint(date: Date) {
  const jd = julianDate(date);
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * DEG;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
  const eps = 23.439 * DEG;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda)) * RAD;
  const gmst = gmstHours(date);
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) * RAD;
  let lon = ra - gmst * 15;
  lon = ((((lon + 180) % 360) + 360) % 360) - 180;
  return { lat: dec, lon };
}

export type ZenithCoord = { ra: number; dec: number; lst: number };
export function zenithEquatorial(date: Date, lat: number, lon: number): ZenithCoord {
  const lst = localSiderealTime(date, lon);
  return { ra: lst * 15, dec: lat, lst };
}

const constellations = [
  { ra: 0, dec: 30, name: "Andromeda" },
  { ra: 30, dec: 60, name: "Cassiopeia" },
  { ra: 80, dec: 45, name: "Auriga" },
  { ra: 90, dec: 20, name: "Orion" },
  { ra: 120, dec: 5, name: "Canis Major" },
  { ra: 150, dec: 12, name: "Leo" },
  { ra: 200, dec: -10, name: "Virgo" },
  { ra: 230, dec: -30, name: "Scorpius" },
  { ra: 270, dec: -25, name: "Sagittarius" },
  { ra: 300, dec: 40, name: "Cygnus" },
  { ra: 340, dec: -20, name: "Aquarius" },
  { ra: 10, dec: -10, name: "Pisces" },
];

export function nearestConstellation(ra: number, dec: number) {
  let best = constellations[0];
  let bestD = Infinity;
  for (const c of constellations) {
    const d = Math.hypot(((c.ra - ra + 540) % 360) - 180, c.dec - dec);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return { ...best, separation: bestD };
}

export function formatRA(deg: number) {
  const h = deg / 15;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ss = Math.floor((((h - hh) * 60) - mm) * 60);
  return `${String(hh).padStart(2, "0")}h ${String(mm).padStart(2, "0")}m ${String(ss).padStart(2, "0")}s`;
}

export function formatDec(deg: number) {
  const sign = deg >= 0 ? "+" : "-";
  const a = Math.abs(deg);
  const d = Math.floor(a);
  const m = Math.floor((a - d) * 60);
  const s = Math.floor((((a - d) * 60) - m) * 60);
  return `${sign}${String(d).padStart(2, "0")}° ${String(m).padStart(2, "0")}' ${String(s).padStart(2, "0")}"`;
}
