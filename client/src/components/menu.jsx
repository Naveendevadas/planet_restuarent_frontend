import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PAYLOAD_API = "http://localhost:3000";
const FRONTEND_ORIGIN = "http://localhost:5173";

// ─── CATEGORY DATA ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "all",          label: "All Items",       icon: "🍽️" },
  { value: "kerala",       label: "Kerala Specials",  icon: "🌴" },
  { value: "biryani",      label: "Biryani & Rice",   icon: "🍚" },
  { value: "starters",     label: "Starters",         icon: "🥗" },
  { value: "north-indian", label: "North Indian",     icon: "🫕" },
  { value: "chinese",      label: "Chinese",          icon: "🥢" },
  { value: "continental",  label: "Continental",      icon: "🍝" },
  { value: "seafood",      label: "Seafood",          icon: "🦐" },
  { value: "desserts",     label: "Desserts",         icon: "🍰" },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

const FALLBACK_IMAGES = {
  "kerala":       "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80",
  "biryani":      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
  "starters":     "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80",
  "desserts":     "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80",
  "north-indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80",
  "seafood":      "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=400&q=80",
  "chinese":      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=400&q=80",
  "continental":  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80",
  "default":      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, ::before, ::after { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --green: #1a3828;
    --green-dark: #0f2118;
    --gold: #f0b429;
    --gold-light: #f5c842;
    --card: #1a2d20;
    --card-hover: #1f3326;
    --nav-h: 64px;
    --hero-h: 72px;
    --top-h: calc(var(--nav-h) + var(--hero-h));
  }

  html { scroll-behavior: smooth; }
  body { background: var(--green-dark); margin: 0; overflow: hidden; }

  .mp {
    background: var(--green-dark); color: #fff;
    font-family: 'DM Sans', sans-serif;
    height: 100vh; overflow: hidden;
    display: flex; flex-direction: column;
  }

  /* ── TOP NAV (fixed) ── */
  .mp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    height: var(--nav-h);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 4rem;
    background: rgba(15,33,24,0.97); backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(240,180,41,0.12);
    flex-shrink: 0;
  }
  .mp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .mp-logo-icon {
    width: 38px; height: 38px; background: var(--gold); border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: var(--green-dark);
    line-height: 1.2; text-align: center; letter-spacing: -0.5px;
    transition: transform 0.3s ease;
  }
  .mp-logo-icon:hover { transform: rotate(8deg) scale(1.1); }
  .mp-logo-text { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--gold); letter-spacing: 2px; }
  .mp-logo-sub { font-size: 0.58rem; color: rgba(240,180,41,0.6); letter-spacing: 3px; text-transform: uppercase; display: block; margin-top: -2px; }
  .mp-nav-right { display: flex; align-items: center; gap: 1rem; }
  .mp-back-btn {
    display: flex; align-items: center; gap: 8px;
    background: transparent; border: 1px solid rgba(240,180,41,0.35);
    color: var(--gold); padding: 0.55rem 1.3rem; border-radius: 50px;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .mp-back-btn:hover { background: var(--gold); color: var(--green-dark); transform: translateX(-3px); }
  .mp-back-arrow { transition: transform 0.3s ease; }
  .mp-back-btn:hover .mp-back-arrow { transform: translateX(-4px); }
  .mp-item-count { font-size: 0.8rem; color: rgba(255,255,255,0.4); letter-spacing: 1px; }
  .nav-logo-img { height: 51px; width: auto; object-fit: contain; }

  /* ── SLIM HERO (no bg image, just a header strip, fixed) ── */
  .mp-hero {
    position: fixed;
    top: var(--nav-h);
    left: 0; right: 0;
    z-index: 90;
    height: var(--hero-h);
    display: flex; align-items: center;
    padding: 0 4rem;
    background: var(--green-dark);
    border-bottom: 1px solid rgba(240,180,41,0.1);
    flex-shrink: 0;
  }
  .mp-hero-content { display: flex; align-items: center; gap: 1.2rem; }
  .mp-hero-icon { font-size: 1.6rem; }
  .mp-hero-title {
    font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 900; line-height: 1.1;
  }
  .mp-hero-title em { font-style: normal; background: linear-gradient(135deg,#f0b429,#fce08a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .mp-hero-sub { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-left: 0.5rem; }

  /* ── BODY BELOW FIXED HEADERS ── */
  .mp-body {
    margin-top: var(--top-h);
    display: flex;
    height: calc(100vh - var(--top-h));
    overflow: hidden;
  }

  /* ── SIDEBAR (fixed, full height, only its own scroll) ── */
  .mp-sidebar {
    width: 260px;
    flex-shrink: 0;
    height: 100%;
    overflow-y: auto;
    background: #0d1f16;
    border-right: 1px solid rgba(240,180,41,0.08);
    padding: 2rem 1.2rem;
    scrollbar-width: thin; scrollbar-color: rgba(240,180,41,0.15) transparent;
  }
  .mp-sidebar::-webkit-scrollbar { width: 3px; }
  .mp-sidebar::-webkit-scrollbar-thumb { background: rgba(240,180,41,0.2); border-radius: 3px; }
  .mp-sidebar-label { font-size: 0.65rem; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 0.8rem; padding: 0 0.6rem; }
  .mp-cat-btn {
    display: flex; align-items: center; gap: 10px; width: 100%;
    background: transparent; border: none; color: rgba(255,255,255,0.55);
    padding: 0.75rem 0.9rem; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1); text-align: left;
    margin-bottom: 0.25rem; position: relative; overflow: hidden;
  }
  .mp-cat-btn::before {
    content: ''; position: absolute; inset: 0; border-radius: 12px;
    background: rgba(240,180,41,0.08); opacity: 0; transition: opacity 0.25s;
  }
  .mp-cat-btn:hover::before, .mp-cat-btn.active::before { opacity: 1; }
  .mp-cat-btn.active { color: var(--gold); font-weight: 500; }
  .mp-cat-btn:hover { color: #fff; }
  .mp-cat-icon { font-size: 1.1rem; width: 24px; text-align: center; flex-shrink: 0; }
  .mp-cat-name { flex: 1; }
  .mp-cat-count {
    font-size: 0.7rem; background: rgba(240,180,41,0.12); color: rgba(240,180,41,0.8);
    padding: 2px 7px; border-radius: 50px; transition: all 0.25s;
  }
  .mp-cat-btn.active .mp-cat-count { background: var(--gold); color: var(--green-dark); }
  .mp-sidebar-divider { height: 1px; background: rgba(240,180,41,0.08); margin: 1rem 0.6rem; }

  /* veg filter in sidebar */
  .mp-veg-filter { padding: 0 0.6rem; margin-top: 0.5rem; }
  .mp-veg-filter-label { font-size: 0.65rem; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 0.8rem; }
  .mp-veg-toggle {
    display: flex; align-items: center; gap: 10px;
    background: transparent; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50px; padding: 0.5rem 1rem; width: 100%;
    color: rgba(255,255,255,0.5); font-size: 0.82rem; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.3s ease; justify-content: space-between;
  }
  .mp-veg-toggle.active { border-color: rgba(74,222,128,0.4); color: #4ade80; background: rgba(34,197,94,0.08); }
  .mp-toggle-dot {
    width: 28px; height: 16px; border-radius: 8px; background: rgba(255,255,255,0.1);
    position: relative; transition: all 0.3s ease; flex-shrink: 0;
  }
  .mp-toggle-dot::after {
    content: ''; position: absolute; width: 12px; height: 12px;
    border-radius: 50%; background: rgba(255,255,255,0.4);
    top: 2px; left: 2px; transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .mp-veg-toggle.active .mp-toggle-dot { background: rgba(74,222,128,0.3); }
  .mp-veg-toggle.active .mp-toggle-dot::after { left: 14px; background: #4ade80; }

  /* ── MAIN CONTENT AREA ── */
  .mp-content-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Search + Sort + Results — sticky, never moves */
  .mp-content-header {
    flex-shrink: 0;
    padding: 1rem 3rem 1rem;
    background: var(--green-dark);
    border-bottom: 1px solid rgba(240,180,41,0.07);
  }
  .mp-search-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
  .mp-search-wrap { position: relative; flex: 1; }
  .mp-search-icon { position: absolute; left: 1.1rem; top: 50%; transform: translateY(-50%); color: rgba(240,180,41,0.5); font-size: 1rem; pointer-events: none; }
  .mp-search {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(240,180,41,0.18);
    border-radius: 14px; padding: 0.5rem 1.2rem 0.5rem 3rem;
    color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.92rem; outline: none;
    transition: all 0.3s ease;
  }
  .mp-search:focus { border-color: var(--gold); background: rgba(240,180,41,0.04); box-shadow: 0 0 0 3px rgba(240,180,41,0.08); }
  .mp-search::placeholder { color: rgba(255,255,255,0.25); }
  .mp-sort {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(240,180,41,0.18);
    border-radius: 14px; padding: 0.5rem 1.2rem; color: rgba(255,255,255,0.6);
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem; outline: none; cursor: pointer;
    transition: all 0.3s ease;
  }
  .mp-sort:focus { border-color: var(--gold); }
  .mp-sort option { background: #0f2118; }

  /* Results bar */
  .mp-results-bar { display: flex; align-items: center; justify-content: space-between; }
  .mp-results-text { font-size: 0.8rem; color: rgba(255,255,255,0.35); letter-spacing: 0.5px; }
  .mp-results-text span { color: var(--gold); font-weight: 500; }
  .mp-view-toggle { display: flex; gap: 0.4rem; }
  .mp-view-btn {
    width: 34px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
    background: transparent; color: rgba(255,255,255,0.4); cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 0.9rem;
    transition: all 0.25s ease;
  }
  .mp-view-btn.active { background: rgba(240,180,41,0.12); border-color: rgba(240,180,41,0.3); color: var(--gold); }
  .mp-view-btn:hover { color: #fff; }

  /* ── SCROLLABLE DISHES AREA ONLY ── */
  .mp-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 3.5rem 3rem;
    scrollbar-width: thin; scrollbar-color: rgba(240,180,41,0.15) transparent;
  }
  .mp-scroll-area::-webkit-scrollbar { width: 4px; }
  .mp-scroll-area::-webkit-scrollbar-thumb { background: rgba(240,180,41,0.2); border-radius: 4px; }

  /* Category section heading */
  .mp-section { margin-bottom: 3.5rem; animation: fadeSlideUp 0.5s ease both; }
  .mp-section-head {
    display: flex; align-items: center; gap: 1rem;
    margin-bottom: 1.8rem; padding-bottom: 1rem;
    border-bottom: 1px solid rgba(240,180,41,0.1);
  }
  .mp-section-icon { font-size: 1.8rem; }
  .mp-section-title { font-family: 'Playfair Display', serif; font-size: 1.7rem; font-weight: 700; color: #fff; }
  .mp-section-count { font-size: 0.75rem; background: rgba(240,180,41,0.1); color: var(--gold); padding: 3px 10px; border-radius: 50px; letter-spacing: 1px; margin-left: auto; }

  /* ── GRID VIEW ── */
  .mp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }

  /* ── LIST VIEW ── */
  .mp-list { display: flex; flex-direction: column; gap: 1rem; }

  /* ── CARD (GRID) ── */
  .mp-card-grid {
    background: linear-gradient(160deg, var(--card) 0%, #152219 100%);
    border: 1px solid rgba(240,180,41,0.1); border-radius: 20px;
    overflow: hidden; cursor: default;
    transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.4s ease, box-shadow 0.5s cubic-bezier(0.22,1,0.36,1);
    will-change: transform, box-shadow;
    animation: fadeSlideUp 0.5s ease both;
  }
  .mp-card-grid:hover {
    transform: translateY(-8px);
    border-color: rgba(240,180,41,0.4);
    box-shadow: 0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(240,180,41,0.12), inset 0 1px 0 rgba(240,180,41,0.06);
  }
  .mp-card-img-wrap { position: relative; height: 180px; overflow: hidden; }
  .mp-card-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.22,1,0.36,1), filter 0.6s ease;
    filter: saturate(0.9);
  }
  .mp-card-grid:hover .mp-card-img { transform: scale(1.08); filter: saturate(1.15) brightness(1.05); }
  .mp-card-img-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(15,33,24,0.85) 100%); }
  .mp-card-badges { position: absolute; top: 0.8rem; left: 0.8rem; display: flex; gap: 0.4rem; }
  .mp-popular { background: var(--gold); color: var(--green-dark); font-size: 0.58rem; font-weight: 700; padding: 2px 8px; border-radius: 50px; letter-spacing: 1px; text-transform: uppercase; }
  .mp-card-body { padding: 1.2rem 1.3rem 1.3rem; }
  .mp-card-cat { font-size: 0.62rem; letter-spacing: 2.5px; text-transform: uppercase; color: var(--gold); margin-bottom: 0.4rem; font-weight: 500; }
  .mp-card-name { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 0.45rem; line-height: 1.3; }
  .mp-card-desc { font-size: 0.78rem; color: rgba(255,255,255,0.45); line-height: 1.55; margin-bottom: 1rem; min-height: 2.4rem; }
  .mp-card-footer { display: flex; align-items: center; justify-content: space-between; }
  .mp-card-price { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--gold); }
  .mp-card-tag { font-size: 0.72rem; padding: 3px 9px; border-radius: 50px; font-weight: 500; }
  .mp-card-tag.veg { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
  .mp-card-tag.nonveg { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

  /* ── CARD (LIST) ── */
  .mp-card-list {
    display: flex; gap: 1.2rem; align-items: center;
    background: linear-gradient(135deg, var(--card) 0%, #152219 100%);
    border: 1px solid rgba(240,180,41,0.1); border-radius: 18px; padding: 1rem;
    transition: all 0.45s cubic-bezier(0.22,1,0.36,1); will-change: transform;
    animation: fadeSlideUp 0.45s ease both;
  }
  .mp-card-list:hover {
    transform: translateX(6px);
    border-color: rgba(240,180,41,0.35);
    box-shadow: 0 10px 35px rgba(0,0,0,0.35), -4px 0 0 var(--gold);
  }
  .mp-list-img {
    width: 90px; height: 90px; border-radius: 14px; object-fit: cover; flex-shrink: 0;
    transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), filter 0.4s ease;
    filter: saturate(0.9);
  }
  .mp-card-list:hover .mp-list-img { transform: scale(1.06) rotate(2deg); filter: saturate(1.2); }
  .mp-list-body { flex: 1; min-width: 0; }
  .mp-list-name { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.3rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mp-list-desc { font-size: 0.78rem; color: rgba(255,255,255,0.4); line-height: 1.5; margin-bottom: 0.4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mp-list-meta { display: flex; align-items: center; gap: 0.6rem; }
  .mp-list-cat { font-size: 0.65rem; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); }
  .mp-list-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; flex-shrink: 0; }
  .mp-list-price { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: var(--gold); }

  /* ── EMPTY / LOADING / ERROR ── */
  .mp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem 0; gap: 1.2rem; }
  .mp-spinner { width: 48px; height: 48px; border: 3px solid rgba(240,180,41,0.12); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.85s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .mp-loading p { color: rgba(255,255,255,0.35); font-size: 0.88rem; letter-spacing: 1px; }
  .mp-error { text-align: center; padding: 5rem 0; }
  .mp-error p { color: rgba(255,100,100,0.7); margin-bottom: 1.2rem; }
  .mp-retry { background: transparent; border: 1px solid rgba(240,180,41,0.35); color: var(--gold); padding: 0.6rem 1.6rem; border-radius: 50px; cursor: pointer; font-size: 0.85rem; transition: all 0.25s; font-family: 'DM Sans', sans-serif; }
  .mp-retry:hover { background: rgba(240,180,41,0.1); }
  .mp-empty { text-align: center; padding: 5rem 0; }
  .mp-empty-icon { font-size: 3rem; margin-bottom: 1rem; display: block; opacity: 0.5; }
  .mp-empty p { color: rgba(255,255,255,0.3); font-size: 0.92rem; letter-spacing: 0.5px; }

  /* ── ANIMATIONS ── */
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

  /* ── RESPONSIVE ── */
  @media (max-width: 1100px) {
    .mp-grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  }
  @media (max-width: 900px) {
    :root { --hero-h: 56px; }
    .mp-nav { padding: 0 1.5rem; }
    .mp-hero { padding: 0 1.5rem; }
    .mp-body { flex-direction: column; }
    .mp-sidebar {
      width: 100%; height: auto; max-height: 120px;
      overflow-x: auto; overflow-y: hidden;
      display: flex; flex-direction: row; flex-wrap: nowrap;
      border-right: none; border-bottom: 1px solid rgba(240,180,41,0.08);
      padding: 0.6rem 1rem;
    }
    .mp-sidebar-label, .mp-sidebar-divider, .mp-veg-filter { display: none; }
    .mp-cat-btn { flex-shrink: 0; padding: 0.5rem 0.75rem; }
    .mp-content-header { padding: 1rem 1.2rem 0.75rem; }
    .mp-scroll-area { padding: 1.2rem 1.2rem 2rem; }
    .mp-grid { grid-template-columns: repeat(2, 1fr); gap: 0.85rem; }
  }
  @media (max-width: 520px) {
    .mp-grid { grid-template-columns: 1fr; }
    .mp-hero-title { font-size: 1.1rem; }
    .mp-hero-sub { display: none; }
  }
`;

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useMenuItems() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchMenu = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(
        `${PAYLOAD_API}/api/menu?where[available][equals]=true&depth=1&limit=200`,
        { headers: { "Content-Type": "application/json", "Origin": FRONTEND_ORIGIN }, mode: "cors", credentials: "include" }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      const mapped = (data.docs || []).map(doc => {
        let imgUrl = FALLBACK_IMAGES[doc.category] || FALLBACK_IMAGES["default"];
        if (doc.image) {
          if (doc.image?.url) imgUrl = doc.image.url.startsWith("http") ? doc.image.url : `${PAYLOAD_API}${doc.image.url}`;
          else if (doc.image?.filename) imgUrl = `${PAYLOAD_API}/media/${doc.image.filename}`;
        }
        return {
          id: doc.id, name: doc.name, description: doc.description || "",
          price: `₹${doc.price}`, veg: doc.veg, isPopular: doc.isPopular,
          category: doc.category,
          cuisineLabel: CATEGORY_MAP[doc.category]?.label || doc.category,
          img: imgUrl,
          fallback: FALLBACK_IMAGES[doc.category] || FALLBACK_IMAGES["default"],
        };
      });
      setItems(mapped);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMenu(); }, []);
  return { items, loading, error, refetch: fetchMenu };
}

// ─── SMART IMAGE ─────────────────────────────────────────────────────────────
function SmartImg({ src, fallback, alt, className }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setImgSrc(src); setLoaded(false); }, [src]);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, [imgSrc]);

  return (
    <img
      ref={ref}
      className={className}
      src={imgSrc}
      alt={alt}
      style={{
        opacity: loaded ? 1 : 0,
        filter: loaded ? "blur(0px) saturate(0.9)" : "blur(8px) saturate(0)",
        transition: loaded
          ? "opacity 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.6s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)"
          : "none",
      }}
      onLoad={() => setLoaded(true)}
      onError={() => { if (imgSrc !== fallback) { setImgSrc(fallback); setLoaded(false); } else setLoaded(true); }}
    />
  );
}

// ─── MENU CARD (GRID) ────────────────────────────────────────────────────────
function GridCard({ item, delay }) {
  return (
    <div className="mp-card-grid" style={{ animationDelay: `${delay}s` }}>
      <div className="mp-card-img-wrap">
        <SmartImg src={item.img} fallback={item.fallback} alt={item.name} className="mp-card-img" />
        <div className="mp-card-img-overlay" />
        <div className="mp-card-badges">
          {item.isPopular && <span className="mp-popular">⭐ Popular</span>}
        </div>
      </div>
      <div className="mp-card-body">
        <p className="mp-card-cat">{item.cuisineLabel}</p>
        <h3 className="mp-card-name">{item.name}</h3>
        <p className="mp-card-desc">{item.description || "A delicious dish crafted by our expert chefs."}</p>
        <div className="mp-card-footer">
          <span className="mp-card-price">{item.price}</span>
          <span className={`mp-card-tag ${item.veg ? "veg" : "nonveg"}`}>{item.veg ? "🟢 Veg" : "🔴 Non-Veg"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── MENU CARD (LIST) ────────────────────────────────────────────────────────
function ListCard({ item, delay }) {
  return (
    <div className="mp-card-list" style={{ animationDelay: `${delay}s` }}>
      <SmartImg src={item.img} fallback={item.fallback} alt={item.name} className="mp-list-img" />
      <div className="mp-list-body">
        <h3 className="mp-list-name">{item.name}</h3>
        <p className="mp-list-desc">{item.description || "A delicious dish crafted by our expert chefs."}</p>
        <div className="mp-list-meta">
          <span className="mp-list-cat">{item.cuisineLabel}</span>
          {item.isPopular && <span className="mp-popular">⭐ Popular</span>}
        </div>
      </div>
      <div className="mp-list-right">
        <span className="mp-list-price">{item.price}</span>
        <span className={`mp-card-tag ${item.veg ? "veg" : "nonveg"}`}>{item.veg ? "🟢" : "🔴"}</span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search,         setSearch]         = useState("");
  const [vegOnly,        setVegOnly]        = useState(false);
  const [view,           setView]           = useState("grid");
  const [sort,           setSort]           = useState("default");

  const { items, loading, error, refetch } = useMenuItems();

  // Count per category (respects filters)
  const countFor = (cat) => {
    let list = cat === "all" ? items : items.filter(i => i.category === cat);
    if (vegOnly) list = list.filter(i => i.veg);
    if (search.trim()) list = list.filter(i =>
      (i.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.description || "").toLowerCase().includes(search.toLowerCase())
    );
    return list.length;
  };

  // Filtered + sorted master list
  const filtered = (() => {
    let list = activeCategory === "all" ? items : items.filter(i => i.category === activeCategory);
    if (vegOnly) list = list.filter(i => i.veg);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        (i.name || "").toLowerCase().includes(q) ||
        (i.description || "").toLowerCase().includes(q) ||
        (i.cuisineLabel || "").toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc")  list = [...list].sort((a, b) => parseInt(a.price.replace("₹","")) - parseInt(b.price.replace("₹","")));
    if (sort === "price-desc") list = [...list].sort((a, b) => parseInt(b.price.replace("₹","")) - parseInt(a.price.replace("₹","")));
    if (sort === "popular")    list = [...list].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    if (sort === "name")       list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  })();

  // Group by category for "all" view
  const grouped = (() => {
    if (activeCategory !== "all") {
      const cat = CATEGORY_MAP[activeCategory];
      return [{ cat, items: filtered }];
    }
    return CATEGORIES.filter(c => c.value !== "all").map(cat => ({
      cat,
      items: filtered.filter(i => i.category === cat.value),
    })).filter(g => g.items.length > 0);
  })();

  const handleCatClick = (val) => {
    setActiveCategory(val);
    setSearch("");
  };

  const activeCat = CATEGORY_MAP[activeCategory] || CATEGORY_MAP["all"];

  return (
    <>
      <style>{styles}</style>
      <div className="mp">

        {/* ── TOP NAV (fixed) ── */}
        <nav className="mp-nav">
          <a className="mp-logo" href="/">
            <img src="public/images/planet-logo-transparent.png" alt="Planet Restaurant" className="nav-logo-img" />
          </a>
          <div className="mp-nav-right">
            <span className="mp-item-count">{filtered.length} dishes</span>
            <button className="mp-back-btn" onClick={() => window.history.back()}>
              <span className="mp-back-arrow">←</span> Back to Home
            </button>
          </div>
        </nav>

        {/* ── SLIM HERO HEADER (fixed, no bg image) ── */}
        <div className="mp-hero">
          <div className="mp-hero-content">
            <span className="mp-hero-icon">{activeCat.icon}</span>
            <h1 className="mp-hero-title"><em>{activeCat.label}</em></h1>
            <span className="mp-hero-sub">
              {activeCategory === "all"
                ? `${items.length}+ dishes across 8 cuisines`
                : `${countFor(activeCategory)} dishes available`}
            </span>
          </div>
        </div>

        {/* ── BODY: sidebar + content side by side ── */}
        <div className="mp-body">

          {/* SIDEBAR */}
          <aside className="mp-sidebar">
            <p className="mp-sidebar-label">Cuisines</p>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`mp-cat-btn ${activeCategory === cat.value ? "active" : ""}`}
                onClick={() => handleCatClick(cat.value)}
              >
                <span className="mp-cat-icon">{cat.icon}</span>
                <span className="mp-cat-name">{cat.label}</span>
                <span className="mp-cat-count">{countFor(cat.value)}</span>
              </button>
            ))}

            <div className="mp-sidebar-divider" />

            <div className="mp-veg-filter">
              <p className="mp-veg-filter-label">Dietary</p>
              <button className={`mp-veg-toggle ${vegOnly ? "active" : ""}`} onClick={() => setVegOnly(v => !v)}>
                <span>🟢 Veg Only</span>
                <span className="mp-toggle-dot" />
              </button>
            </div>
          </aside>

          {/* RIGHT SIDE: fixed header + scrollable dishes */}
          <div className="mp-content-wrap">

            {/* Search + Sort + Results — NEVER SCROLLS */}
            <div className="mp-content-header">
              <div className="mp-search-row">
                <div className="mp-search-wrap">
                  <span className="mp-search-icon">🔍</span>
                  <input
                    className="mp-search"
                    type="text"
                    placeholder="Search dishes, ingredients..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select className="mp-sort" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="default">Sort: Default</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="name">Name: A → Z</option>
                </select>
              </div>

              {!loading && !error && (
                <div className="mp-results-bar">
                  <p className="mp-results-text">
                    Showing <span>{filtered.length}</span> dish{filtered.length !== 1 ? "es" : ""}
                    {search && <> for "<span>{search}</span>"</>}
                    {vegOnly && <> · <span>Veg Only</span></>}
                  </p>
                  <div className="mp-view-toggle">
                    <button className={`mp-view-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")} title="Grid view">⊞</button>
                    <button className={`mp-view-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")} title="List view">☰</button>
                  </div>
                </div>
              )}
            </div>

            {/* ONLY THIS PART SCROLLS */}
            <div className="mp-scroll-area">

              {loading && (
                <div className="mp-loading">
                  <div className="mp-spinner" />
                  <p>Loading dishes...</p>
                </div>
              )}

              {!loading && error && (
                <div className="mp-error">
                  <p>⚠ Could not load menu — {error}</p>
                  <button className="mp-retry" onClick={refetch}>Try Again</button>
                </div>
              )}

              {!loading && !error && filtered.length === 0 && (
                <div className="mp-empty">
                  <span className="mp-empty-icon">🍽️</span>
                  <p>No dishes found. Try a different search or category.</p>
                </div>
              )}

              {!loading && !error && grouped.map(({ cat, items: groupItems }) => (
                groupItems.length > 0 && (
                  <div className="mp-section" key={cat.value} id={`cat-${cat.value}`}>
                    <div className="mp-section-head">
                      <span className="mp-section-icon">{cat.icon}</span>
                      <h2 className="mp-section-title">{cat.label}</h2>
                      <span className="mp-section-count">{groupItems.length} items</span>
                    </div>

                    {view === "grid" ? (
                      <div className="mp-grid">
                        {groupItems.map((item, idx) => (
                          <GridCard key={item.id} item={item} delay={idx * 0.06} />
                        ))}
                      </div>
                    ) : (
                      <div className="mp-list">
                        {groupItems.map((item, idx) => (
                          <ListCard key={item.id} item={item} delay={idx * 0.04} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}