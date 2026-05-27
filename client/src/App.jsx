import { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Menu from "./components/menu";
import PlanetCorner from "./components/PlanetCorner";
import MenuPage from "./components/MenuPage";
import { ChefHat, Leaf, Globe2, CalendarHeart, Sparkles } from "lucide-react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const PAYLOAD_API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PLANET_MAIN_RESTAURANT_ID = "6a0bea7b41a1fafddaf26d7c";
const STATUS_REFRESH_MS = 30_000;

// ─── CATEGORY LABEL MAP ───────────────────────────────────────────────────────
const categoryLabels = {
  "kerala":       "Kerala Specials",
  "biryani":      "Biryani & Rice",
  "starters":     "Starters",
  "desserts":     "Desserts",
  "north-indian": "North Indian",
  "seafood":      "Seafood",
  "chinese":      "Chinese",
  "continental":  "Continental",
};

const tabs = [
  { label: "All",             value: "all" },
  { label: "Kerala Specials", value: "kerala" },
  { label: "Biryani & Rice",  value: "biryani" },
  { label: "Starters",        value: "starters" },
  { label: "North Indian",    value: "north-indian" },
  { label: "Chinese",         value: "chinese" },
  { label: "Continental",     value: "continental" },
  { label: "Seafood",         value: "seafood" },
  { label: "Desserts",        value: "desserts" },
];

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

// ─── FEATURES ────────────────────────────────────────────────────────────────
const features = [
  {
    icon: <ChefHat size={34} strokeWidth={1.5} />,
    title: "Master Chefs",
    text: "Our team of expert chefs brings decades of experience from around the world, crafting dishes with love and precision.",
  },
  {
    icon: <Leaf size={34} strokeWidth={1.5} />,
    title: "Farm Fresh Ingredients",
    text: "We source only the freshest local produce and premium ingredients every morning to ensure quality in every bite.",
  },
  {
    icon: <Globe2 size={34} strokeWidth={1.5} />,
    title: "World Cuisines",
    text: "From Kerala to Korea, from Italy to India — explore 200+ dishes from across the globe without leaving your seat.",
  },
  {
    icon: <CalendarHeart size={34} strokeWidth={1.5} />,
    title: "Special Events",
    text: "Celebrate birthdays, anniversaries, and corporate events with us. We make every occasion truly memorable.",
  },
  {
    icon: <Sparkles size={34} strokeWidth={1.5} />,
    title: "Luxury Ambience",
    text: "Step into an atmosphere designed for comfort and elegance — the perfect setting for an unforgettable meal.",
  },
];

// ─── GALLERY ─────────────────────────────────────────────────────────────────
const gallery = [
  {
    img:   "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
    label: "Kerala Feast",
    span:  true,
  },
  {
    img:   "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    label: "Biryani",
  },
  {
    img:   "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80",
    label: "Seafood",
  },
  {
    img:   "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80",
    label: "Continental",
  },
  {
    img:   "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80",
    label: "Desserts",
  },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');
  *,::before,::after{margin:0;padding:0;box-sizing:border-box}
  :root{--green:#1a3828;--green-dark:#0f2118;--gold:#f0b429;--gold-light:#f5c842;--card-bg:#1e2e22}
  body{background:#0f2118}
  .planet-site{background:#0f2118;color:#fff;font-family:'DM Sans',sans-serif;overflow-x:hidden;min-height:100vh}

  /* NAV */
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.2rem 4rem;background:rgba(15,33,24,0.75);backdrop-filter:blur(14px);border-bottom:1px solid rgba(240,180,41,0.15);transition:all 0.4s ease}
  .nav.scrolled{padding:0.8rem 4rem;background:rgba(15,33,24,0.95);box-shadow:0 4px 30px rgba(0,0,0,0.4)}
  .logo-wrap{display:flex;align-items:center;gap:12px}
  .logo-icon{width:42px;height:42px;background:#f0b429;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#0f2118;line-height:1.2;text-align:center;letter-spacing:-0.5px;transition:transform 0.3s ease}
  .logo-icon:hover{transform:rotate(8deg) scale(1.1)}
  .logo-text{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:#f0b429;letter-spacing:2px;display:block}
  .logo-sub{font-size:0.6rem;color:rgba(240,180,41,0.7);letter-spacing:3px;text-transform:uppercase;display:block;margin-top:-2px}
  .nav-links{display:flex;gap:2.5rem;list-style:none}
  .nav-links a{color:rgba(255,255,255,0.75);text-decoration:none;font-size:0.88rem;letter-spacing:0.5px;transition:color 0.2s;cursor:pointer;position:relative;padding-bottom:4px}
  .nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1px;background:#f0b429;transition:width 0.3s ease}
  .nav-links a:hover::after,.nav-links a.active::after{width:100%}
  .nav-links a:hover,.nav-links a.active{color:#f0b429}
  .nav-btn{background:#f0b429;color:#0f2118;border:none;padding:0.6rem 1.4rem;border-radius:50px;font-family:'DM Sans',sans-serif;font-weight:500;font-size:0.88rem;cursor:pointer;transition:all 0.25s;letter-spacing:0.3px;position:relative;overflow:hidden}
  .nav-btn::before{content:'';position:absolute;inset:0;background:rgba(255,255,255,0.2);transform:translateX(-100%);transition:transform 0.3s ease}
  .nav-btn:hover::before{transform:translateX(0)}
  .nav-btn:hover{transform:scale(1.04);box-shadow:0 6px 20px rgba(240,180,41,0.4)}
  .nav-logo-img{height:51px;width:auto;object-fit:contain}

 /* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8rem 2rem 5rem;position:relative;overflow:hidden;isolation:isolate}
.hero-bg{position:absolute;inset:0;background-image:url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80');background-size:cover;background-position:center;transform:scale(1.05);z-index:-3;transition:transform 8s ease}
.hero:hover .hero-bg{transform:scale(1.08)}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,22,16,0.82) 0%,rgba(10,22,16,0.55) 40%,rgba(10,22,16,0.82) 100%);z-index:-2}
.hero-grain{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");opacity:0.06;mix-blend-mode:overlay;z-index:-1;pointer-events:none}

.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(240,180,41,0.12);border:1px solid rgba(240,180,41,0.4);padding:0.5rem 1.3rem;border-radius:50px;font-size:0.72rem;letter-spacing:3px;text-transform:uppercase;color:#f5c842;margin-bottom:2rem;backdrop-filter:blur(10px);animation:fadeSlideDown 0.8s ease both}
.hero-badge.closed{background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.35);color:#f87171}
.badge-dot{width:6px;height:6px;background:#f0b429;border-radius:50%;display:inline-block;box-shadow:0 0 12px #f0b429;animation:pulse 1.8s infinite}
.hero-badge.closed .badge-dot{background:#f87171;box-shadow:0 0 12px #f87171}

.hero-eyebrow{font-size:0.78rem;letter-spacing:4px;text-transform:uppercase;color:rgba(240,180,41,0.7);margin-bottom:1.2rem;font-weight:400;animation:fadeSlideDown 0.8s 0.1s ease both}
.hero h1{font-family:'Playfair Display',serif;font-size:5rem;line-height:1.05;font-weight:900;margin-bottom:1.4rem;animation:fadeSlideUp 0.9s 0.2s ease both;max-width:820px}
.hero h1 em{font-style:normal;display:block;font-size:2.2rem;font-weight:400;letter-spacing:2px;background:linear-gradient(135deg,#f0b429 0%,#fce08a 50%,#f0b429 100%);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite,fadeSlideUp 0.9s 0.3s ease both;margin-top:0.6rem}
.hero-desc{color:rgba(255,255,255,0.7);font-size:1.05rem;line-height:1.8;max-width:560px;margin:0 auto 2.5rem;animation:fadeSlideUp 0.9s 0.35s ease both}

.hero-divider{width:60px;height:2px;background:linear-gradient(90deg,transparent,#f0b429,transparent);margin:0 auto 2.5rem;animation:fadeSlideUp 0.9s 0.3s ease both}

.hero-btns{display:flex;gap:1rem;align-items:center;justify-content:center;flex-wrap:wrap;animation:fadeSlideUp 0.9s 0.5s ease both;margin-bottom:3.5rem}
.btn-primary{background:#f0b429;color:#0f2118;border:none;padding:0.95rem 2.4rem;border-radius:50px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:0.95rem;cursor:pointer;transition:all 0.3s;letter-spacing:0.5px;box-shadow:0 8px 30px rgba(240,180,41,0.35)}
.btn-primary:hover{background:#f5c842;transform:translateY(-3px);box-shadow:0 16px 40px rgba(240,180,41,0.5)}
.btn-ghost{background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.35);padding:0.95rem 2.4rem;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:0.95rem;cursor:pointer;transition:all 0.3s;backdrop-filter:blur(10px);letter-spacing:0.5px}
.btn-ghost:hover{border-color:#f0b429;color:#f0b429;background:rgba(240,180,41,0.08);transform:translateY(-3px)}

.hero-cuisine-strip{display:flex;align-items:center;justify-content:center;gap:0;background:rgba(255,255,255,0.04);border:1px solid rgba(240,180,41,0.15);border-radius:60px;padding:0.4rem;backdrop-filter:blur(12px);animation:fadeSlideUp 0.9s 0.6s ease both;flex-wrap:wrap}
.cuisine-pill{display:flex;align-items:center;gap:8px;padding:0.6rem 1.4rem;border-radius:50px;font-size:0.78rem;color:rgba(255,255,255,0.75);font-weight:400;letter-spacing:0.5px;transition:all 0.3s;white-space:nowrap}
.cuisine-pill:hover{background:rgba(240,180,41,0.12);color:#f0b429}
.cuisine-pill-icon{font-size:1.1rem}
.cuisine-sep{width:1px;height:20px;background:rgba(240,180,41,0.2);flex-shrink:0}

.hero-scroll{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.4;animation:fadeSlideUp 1s 1s ease both;cursor:pointer}
.hero-scroll span{font-size:0.6rem;letter-spacing:3px;text-transform:uppercase}
.hero-scroll-arrow{width:22px;height:22px;border-right:1.5px solid #f0b429;border-bottom:1.5px solid #f0b429;transform:rotate(45deg);animation:bounce 2s ease-in-out infinite}
@keyframes bounce{0%,100%{transform:rotate(45deg) translateY(0)}50%{transform:rotate(45deg) translateY(6px)}}

/* HERO MOBILE */
@media(max-width:768px){
  .hero{padding:6rem 1.5rem 4rem}
  .hero h1{font-size:2.6rem}
  .hero h1 em{font-size:1.4rem}
  .hero-desc{font-size:0.92rem}
  .hero-btns{flex-direction:column;align-items:center}
  .btn-primary,.btn-ghost{width:100%;max-width:280px;justify-content:center}
  .hero-cuisine-strip{gap:0.3rem;border-radius:20px;padding:0.4rem}
  .cuisine-sep{display:none}
  .cuisine-pill{padding:0.4rem 0.8rem;font-size:0.72rem}
}
@media(max-width:400px){
  .hero h1{font-size:2rem}
}

  /* STATS */
  .stats{display:flex;border-top:1px solid rgba(240,180,41,0.1);border-bottom:1px solid rgba(240,180,41,0.1)}
  .stat{flex:1;padding:2rem 3rem;text-align:center;border-right:1px solid rgba(240,180,41,0.1);transition:background 0.3s ease}
  .stat:last-child{border-right:none}
  .stat:hover{background:rgba(240,180,41,0.04)}
  .stat-num{font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:700;color:#f0b429;display:block}
  .stat-label{font-size:0.8rem;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;margin-top:4px;display:block}

  /* SECTION */
  .section{padding:5rem 4rem}
  .section-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:3rem}
  .section-label{font-size:0.75rem;letter-spacing:3px;text-transform:uppercase;color:#f0b429;margin-bottom:0.5rem}
  .section-title{font-family:'Playfair Display',serif;font-size:2.6rem;font-weight:700;line-height:1.2}
  .section-desc{color:rgba(255,255,255,0.5);font-size:0.9rem;max-width:300px;text-align:right;line-height:1.6}

  /* MENU TABS */
  .menu-tabs{display:flex;gap:0.5rem;margin-bottom:4.5rem;flex-wrap:wrap}
  .tab{background:transparent;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);padding:0.5rem 1.3rem;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:0.85rem;cursor:pointer;transition:all 0.25s}
  .tab.active,.tab:hover{background:#f0b429;color:#0f2118;border-color:#f0b429;font-weight:500;transform:translateY(-2px);box-shadow:0 6px 20px rgba(240,180,41,0.25)}

  /* MENU GRID */
  .menu-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;row-gap:7rem;padding-top:6rem}
  .menu-card{position:relative;background:linear-gradient(180deg,#1e2e22 0%,#182520 100%);border-radius:24px;padding:6rem 1.3rem 1.6rem;border:1px solid rgba(240,180,41,0.12);text-align:center;overflow:visible;animation:fadeSlideUp 0.6s ease both;cursor:pointer;transition:transform 0.55s cubic-bezier(0.22,1,0.36,1),border-color 0.4s ease,box-shadow 0.55s cubic-bezier(0.22,1,0.36,1),background 0.4s ease}
  .menu-card:hover{transform:translateY(-14px) scale(1.012);border-color:rgba(240,180,41,0.55);background:linear-gradient(180deg,#223323 0%,#1b2a22 100%);box-shadow:0 25px 55px rgba(0,0,0,0.45),0 0 0 1px rgba(240,180,41,0.2)}
  .plate-img-wrap{position:absolute;top:-75px;left:50%;transform:translateX(-50%);width:160px;height:160px;border-radius:50%;overflow:hidden;box-shadow:0 20px 45px rgba(0,0,0,0.5),0 0 0 5px rgba(15,33,24,0.9),0 0 0 6px rgba(240,180,41,0.15);transition:transform 0.7s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.7s ease}
  .menu-card:hover .plate-img-wrap{transform:translateX(-50%) translateY(-14px) scale(1.18);box-shadow:0 35px 70px rgba(0,0,0,0.7),0 0 0 5px rgba(15,33,24,0.9),0 0 0 9px rgba(90,87,79,0.55)}
  .plate-img{position:absolute;top:0;left:0;width:100%;height:100%;border-radius:50%;object-fit:cover;transition:transform 0.7s,filter 0.7s,opacity 0.7s;transform:scale(1);opacity:0}
  .plate-img.loading{opacity:0;transform:scale(0.85)}
  .plate-img.loaded{opacity:1;transform:scale(1)}
  .menu-card:hover .plate-img.loaded{transform:scale(1.12);filter:brightness(1.1) saturate(1.2)}
  .heart-btn{position:absolute;top:1rem;right:1rem;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.25s;font-size:0.9rem}
  .heart-btn:hover,.heart-btn.liked{color:#ff5a7a;border-color:rgba(255,90,122,0.5);background:rgba(255,90,122,0.1);transform:scale(1.2)}
  .popular-tag{position:absolute;top:1rem;left:1rem;background:#f0b429;color:#0f2118;font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:50px;letter-spacing:1px;text-transform:uppercase;animation:pulse 2s infinite}
  .card-cuisine{font-size:0.65rem;letter-spacing:2.5px;text-transform:uppercase;color:#f0b429;margin-bottom:0.45rem;font-weight:500}
  .card-name{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;color:#fff}
  .card-desc{font-size:0.8rem;color:rgba(255,255,255,0.5);line-height:1.55;margin-bottom:1.1rem;min-height:2.5rem}
  .menu-card-footer{display:flex;align-items:center;justify-content:space-between;padding-top:1.1rem;border-top:1px solid rgba(240,180,41,0.1)}
  .menu-price{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:#f0b429}
  .veg-badge{font-size:0.75rem;padding:2px 8px;border-radius:50px;font-weight:500}
  .veg-badge.veg{background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3)}
  .veg-badge.nonveg{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)}
  .show-more-wrap{display:flex;justify-content:center;margin-top:3.5rem}
  .show-more-btn{display:inline-flex;align-items:center;gap:12px;background:transparent;border:1.5px solid rgba(240,180,41,0.4);color:#f0b429;padding:0.95rem 2.8rem;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:0.95rem;font-weight:500;cursor:pointer;position:relative;overflow:hidden;transition:all 0.45s cubic-bezier(0.22,1,0.36,1)}
  .show-more-btn::before{content:'';position:absolute;inset:0;background:#f0b429;transform:scaleX(0);transform-origin:left;transition:transform 0.45s cubic-bezier(0.22,1,0.36,1);z-index:0}
  .show-more-btn:hover::before{transform:scaleX(1)}
  .show-more-btn:hover{color:#0f2118;border-color:#f0b429;transform:translateY(-4px);box-shadow:0 16px 40px rgba(240,180,41,0.28)}
  .show-more-btn span,.show-more-icon{position:relative;z-index:1}
  .show-more-icon{font-size:1.1rem;transition:transform 0.35s ease}
  .show-more-btn:hover .show-more-icon{transform:translateX(5px)}

  /* STORY */
  .story{padding:3rem 4rem;background:linear-gradient(180deg,#0f2118 0%,#13291c 100%);position:relative;overflow:hidden}
  .story::before{content:'';position:absolute;top:-150px;right:-150px;width:500px;height:500px;background:radial-gradient(circle,rgba(240,180,41,0.08) 0%,transparent 70%);pointer-events:none}
  .story-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:5rem;align-items:center;position:relative;z-index:1}
  .story-visual{position:relative;height:520px;border-radius:24px;background-image:url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80');background-size:cover;background-position:center;box-shadow:0 30px 70px rgba(0,0,0,0.5);border:1px solid rgba(240,180,41,0.15);transition:transform 0.4s ease}
  .story-visual:hover{transform:scale(1.01)}
  .story-visual::after{content:'';position:absolute;inset:0;border-radius:24px;background:linear-gradient(180deg,transparent 50%,rgba(15,33,24,0.7) 100%)}
  .story-badge{position:absolute;bottom:1.5rem;left:1.5rem;z-index:2;background:rgba(15,33,24,0.9);border:1px solid rgba(240,180,41,0.3);padding:0.8rem 1.2rem;border-radius:16px;backdrop-filter:blur(14px);display:flex;align-items:center;gap:12px}
  .story-badge-num{font-family:'Playfair Display',serif;font-size:2rem;color:#f0b429;font-weight:700}
  .story-badge-text{font-size:0.75rem;color:rgba(255,255,255,0.7);letter-spacing:1px;text-transform:uppercase;line-height:1.4}
  .story h2{font-family:'Playfair Display',serif;font-size:3rem;font-weight:900;line-height:1.1;margin:0.8rem 0 1.5rem}
  .story h2 em{font-style:normal;background:linear-gradient(135deg,#f0b429,#fce08a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .story p{color:rgba(255,255,255,0.65);line-height:1.8;font-size:0.98rem;margin-bottom:1.2rem}
  .story-pillars{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;margin-top:2rem}
  .pillar{padding:1.2rem;border-radius:14px;background:rgba(240,180,41,0.06);border:1px solid rgba(240,180,41,0.18);transition:all 0.3s ease;cursor:default}
  .pillar:hover{background:rgba(240,180,41,0.1);transform:translateY(-3px);border-color:rgba(240,180,41,0.35)}
  .pillar-icon{font-size:1.4rem;margin-bottom:0.5rem;display:block}
  .pillar-title{font-family:'Playfair Display',serif;color:#f0b429;font-weight:700;font-size:1rem;margin-bottom:0.3rem}
  .pillar-text{font-size:0.8rem;color:rgba(255,255,255,0.55);line-height:1.5}
  .chef-signature{font-family:'Playfair Display',serif;font-style:italic;color:#f0b429;font-size:1.1rem;margin-top:1.5rem}
  .chef-role{font-size:0.75rem;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-top:0.2rem}

  /* FEATURES */
  .features{background:#1a3828;padding:5rem 4rem}
  .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:3rem}
  .feature-card{padding:2rem;border:1px solid rgba(240,180,41,0.15);border-radius:20px;transition:all 0.35s cubic-bezier(0.4,0,0.2,1);background:rgba(255,255,255,0.02);position:relative;overflow:hidden}
  .feature-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(240,180,41,0.06) 0%,transparent 60%);opacity:0;transition:opacity 0.3s ease}
  .feature-card:hover::before{opacity:1}
  .feature-card:hover{border-color:rgba(240,180,41,0.4);transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,0.3)}
  .feature-icon{margin-bottom:1rem;display:block;transition:transform 0.3s ease;color:#f0b429}
  .feature-card:hover .feature-icon{transform:scale(1.15) rotate(5deg)}
  .feature-title{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;margin-bottom:0.6rem;color:#f0b429}
  .feature-text{font-size:0.85rem;color:rgba(255,255,255,0.55);line-height:1.7}

  /* GALLERY — real food images */
  .gallery-grid{display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:220px 220px;gap:1rem;margin-top:3rem}
  .gal-item{border-radius:16px;overflow:hidden;position:relative;border:1px solid rgba(240,180,41,0.1);transition:all 0.35s ease;cursor:pointer}
  .gal-item:first-child{grid-row:span 2}
  .gal-item:hover{transform:scale(1.03);border-color:rgba(240,180,41,0.4);box-shadow:0 15px 40px rgba(0,0,0,0.4)}
  .gal-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px;transition:transform 0.5s ease,filter 0.5s ease}
  .gal-item:hover .gal-img{transform:scale(1.08);filter:brightness(1.1) saturate(1.2)}
  .gal-overlay{position:absolute;inset:0;border-radius:16px;background:linear-gradient(180deg,transparent 40%,rgba(10,25,16,0.85) 100%);z-index:1}
  .gal-label{position:absolute;bottom:12px;left:12px;z-index:2;background:rgba(15,33,24,0.85);padding:4px 10px;border-radius:50px;font-size:0.7rem;color:#f0b429;letter-spacing:1px;text-transform:uppercase;backdrop-filter:blur(8px);border:1px solid rgba(240,180,41,0.25)}

  /* BRANCHES */
  .branches{padding:5rem 4rem;background:#13291c;position:relative;overflow:hidden}
  .branches::before{content:'';position:absolute;top:-100px;left:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(240,180,41,0.07),transparent 70%);pointer-events:none}
  .branches-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-top:3rem}
  .branch-card{background:linear-gradient(180deg,#1e2e22,#182520);border:1px solid rgba(240,180,41,0.15);border-radius:24px;padding:2.5rem;transition:all 0.45s cubic-bezier(0.22,1,0.36,1);position:relative;overflow:hidden}
  .branch-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(240,180,41,0.05),transparent);opacity:0;transition:opacity 0.3s}
  .branch-card:hover::before{opacity:1}
  .branch-card:hover{transform:translateY(-8px);border-color:rgba(240,180,41,0.45);box-shadow:0 25px 60px rgba(0,0,0,0.4)}
  .branch-tag{display:inline-block;font-size:0.65rem;letter-spacing:2px;text-transform:uppercase;background:rgba(240,180,41,0.12);border:1px solid rgba(240,180,41,0.3);color:#f0b429;padding:3px 10px;border-radius:50px;margin-bottom:1rem}
  .branch-name{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;color:#fff;margin-bottom:0.3rem}
  .branch-sub{font-size:0.8rem;color:rgba(255,255,255,0.4);letter-spacing:1px;margin-bottom:1.5rem}
  .branch-info{display:flex;flex-direction:column;gap:0.7rem;margin-bottom:1.8rem}
  .branch-row{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,0.6);font-size:0.88rem}
  .branch-row span:first-child{font-size:1rem;width:20px;text-align:center;flex-shrink:0}
  .branch-visit-btn{display:inline-flex;align-items:center;gap:8px;background:transparent;border:1px solid rgba(240,180,41,0.4);color:#f0b429;padding:0.6rem 1.4rem;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:0.85rem;cursor:pointer;transition:all 0.25s}
  .branch-visit-btn:hover{background:#f0b429;color:#0f2118;transform:translateX(4px)}

  /* FOOTER */
  footer{background:#0b1c13;padding:4rem 4rem 0;border-top:1px solid rgba(240,180,41,0.1)}
  .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;padding-bottom:3.5rem}
  .footer-brand p{font-size:0.87rem;color:rgba(255,255,255,0.4);line-height:1.8;margin-top:0.8rem;max-width:260px;margin-bottom:1.5rem}
  .footer-col h4{font-family:'Playfair Display',serif;font-size:1rem;color:#f0b429;margin-bottom:1.2rem;font-weight:700;letter-spacing:0.5px}
  .footer-col ul{list-style:none;display:flex;flex-direction:column;gap:0.65rem}
  .footer-col ul li{font-size:0.85rem;color:rgba(255,255,255,0.45);line-height:1.5}
  .footer-col ul li a{color:rgba(255,255,255,0.45);text-decoration:none;font-size:0.85rem;transition:color 0.2s;cursor:pointer;display:inline-block}
  .footer-col ul li a:hover{color:#f0b429}
  .footer-col ul li strong{color:rgba(255,255,255,0.75);display:block;font-size:0.8rem;font-weight:500}
  .footer-divider{height:1px;background:rgba(240,180,41,0.08)}
  .footer-bottom{padding:1.4rem 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
  .footer-bottom p{font-size:0.78rem;color:rgba(255,255,255,0.25)}
  .social-links{display:flex;gap:0.7rem}
  .social-btn{width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;text-decoration:none;transition:all 0.25s;font-size:1rem;cursor:pointer;color:#fff}
  .social-btn:hover{border-color:rgba(240,180,41,0.5);background:rgba(240,180,41,0.1);transform:translateY(-3px)}
  .footer-hours-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25);border-radius:50px;padding:0.3rem 0.8rem;font-size:0.72rem;color:#4ade80;font-weight:500;margin-bottom:0.5rem}
  .footer-hours-dot{width:5px;height:5px;background:#4ade80;border-radius:50%;animation:pulse 1.8s infinite;display:inline-block;flex-shrink:0}

  /* SCROLL FADE */
  .scroll-fade{opacity:0;transform:translateY(35px);transition:opacity 0.8s cubic-bezier(0.4,0,0.2,1),transform 0.8s cubic-bezier(0.4,0,0.2,1)}
  .scroll-fade.visible{opacity:1;transform:translateY(0)}

  /* TOAST */
  .toast{position:fixed;bottom:2rem;right:2rem;background:#1e2e22;border:1px solid rgba(240,180,41,0.35);border-radius:14px;padding:0.9rem 1.4rem;display:flex;align-items:center;gap:10px;font-size:0.88rem;color:#fff;z-index:999;box-shadow:0 10px 40px rgba(0,0,0,0.4);animation:toastIn 0.4s cubic-bezier(0.4,0,0.2,1)}
  .toast-icon{font-size:1.1rem}

  /* ══════════════════════════════════════════
     FULLY RESPONSIVE — mobile & tablet
  ══════════════════════════════════════════ */
/* ── 1024px ── */
@media(max-width:1024px){
  .menu-grid{grid-template-columns:repeat(3,1fr)}
  .footer-grid{grid-template-columns:1fr 1fr;gap:2rem}
  .footer-brand{grid-column:1/-1}
  .features-grid{grid-template-columns:repeat(2,1fr)}
}

/* ── 768px ── */
@media(max-width:768px){
  .nav{padding:0.75rem 1rem}
  .nav-links{display:none}
  .nav-logo-img{height:34px}
  .nav-btn{font-size:0.75rem;padding:0.45rem 0.9rem;letter-spacing:0}
  .hero{padding:6rem 1.5rem 4rem}
  .hero h1{font-size:2.6rem}
  .hero h1 em{font-size:1.4rem}
  .hero-desc{font-size:0.92rem}
  .hero-btns{flex-direction:column;align-items:center}
  .btn-primary,.btn-ghost{width:100%;max-width:280px;justify-content:center}
  .hero-badge{font-size:0.65rem;padding:0.4rem 0.9rem;letter-spacing:1px;text-align:center;white-space:normal;line-height:1.4}
  .hero-cuisine-strip{gap:0.3rem;border-radius:20px;padding:0.4rem}
  .cuisine-sep{display:none}
  .cuisine-pill{padding:0.4rem 0.8rem;font-size:0.72rem}
  .stats{flex-wrap:wrap}
  .stat{min-width:50%;padding:0.8rem 0.5rem}
  .stat-num{font-size:1.4rem}
  .stat-label{font-size:0.65rem}
  .section{padding:3rem 1.5rem;overflow:visible}
  .section-header{flex-direction:column;gap:0.8rem;align-items:flex-start}
  .section-title{font-size:2rem}
  .section-desc{text-align:left;max-width:100%}
  .menu-tabs{gap:0.4rem;margin-bottom:2rem}
  .tab{font-size:0.78rem;padding:0.4rem 0.9rem}

  /* MENU GRID — 2 columns, absolute image */
  .menu-grid{
    grid-template-columns:1fr 1fr;
    gap:1rem;
    row-gap:100px;
    padding-top:70px;
    margin-top:0;
  }
  .menu-card{
    position:relative;
    padding:65px 0.8rem 1.2rem;
    overflow:visible;
    display:flex;
    flex-direction:column;
    align-items:center;
    text-align:center;
    border-radius:22px;
  }
  .plate-img-wrap{
    position:absolute !important;
    top:-55px !important;
    left:50% !important;
    transform:translateX(-50%) !important;
    width:110px !important;
    height:110px !important;
    margin:0 !important;
  }
  .menu-card:hover .plate-img-wrap{
    transform:translateX(-50%) translateY(-6px) scale(1.08) !important;
  }
  .card-name{font-size:1rem}
  .card-desc{font-size:0.73rem;min-height:auto}
  .menu-price{font-size:1.1rem}
  .heart-btn{top:0.5rem;right:0.5rem;width:28px;height:28px;font-size:0.8rem}
  .popular-tag{top:0.5rem;left:0.5rem;font-size:0.55rem}

  .story{padding:3rem 1.5rem}
  .story-grid{grid-template-columns:1fr;gap:2rem}
  .story-visual{height:260px}
  .story h2{font-size:1.8rem}
  .story-pillars{grid-template-columns:1fr}
  .features{padding:3rem 1.5rem}
  .features-grid{grid-template-columns:1fr;gap:1.2rem}
  .gallery-grid{grid-template-columns:1fr 1fr;grid-template-rows:160px 160px 160px}
  .gal-item:first-child{grid-row:span 1;grid-column:span 2}
  .branches{padding:3rem 1.5rem}
  .branches-grid{grid-template-columns:1fr}
  footer{padding:3rem 1.5rem 0}
  .footer-grid{grid-template-columns:1fr;gap:2rem}
  .footer-brand{grid-column:auto}
  .footer-bottom{flex-direction:column;text-align:center;gap:1rem}
  .toast{right:1rem;left:1rem;bottom:1rem}
}

/* ── 480px — single column ── */
@media(max-width:480px){
  .hero h1{font-size:1.8rem}
  .section-title{font-size:1.7rem}
  .gallery-grid{grid-template-columns:1fr;grid-template-rows:auto}
  .gal-item{height:180px}
  .gal-item:first-child{grid-column:span 1}
  .stat{min-width:50%}

  .menu-grid{
    grid-template-columns:1fr !important;
    gap:0;
    row-gap:100px;
    padding-top:70px;
    margin-top:0;
  }
  .menu-card{
    position:relative;
    padding:65px 1rem 1.2rem;
    overflow:visible;
    display:flex;
    flex-direction:column;
    align-items:center;
    text-align:center;
    border-radius:20px;
  }
  .plate-img-wrap{
    position:absolute !important;
    top:-55px !important;
    left:50% !important;
    transform:translateX(-50%) !important;
    width:110px !important;
    height:110px !important;
    margin:0 !important;
  }
  .menu-card:hover .plate-img-wrap{
    transform:translateX(-50%) translateY(-6px) scale(1.08) !important;
  }
  .card-name{font-size:1rem}
  .card-desc{font-size:0.75rem;min-height:auto}
  .menu-price{font-size:1.1rem}
  .heart-btn{top:0.5rem;right:0.5rem;width:28px;height:28px;font-size:0.8rem}
  .popular-tag{top:0.5rem;left:0.5rem;font-size:0.55rem}
}
`;

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useScrollFade() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, icon = "✅") => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

function useRestaurantStatus() {
  const [status,      setStatus]      = useState(null);
  const [openingTime, setOpeningTime] = useState(null);
  const [closingTime, setClosingTime] = useState(null);
  const [loading,     setLoading]     = useState(true);

  const fetchStatus = () => {
    fetch(`${PAYLOAD_API}/api/restaurant/${PLANET_MAIN_RESTAURANT_ID}`, {
      headers: { "Content-Type": "application/json" }, mode: "cors",
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(doc => {
        setStatus(doc.status ?? "active");
        setOpeningTime(doc.openingTime ?? null);
        setClosingTime(doc.closingTime ?? null);
      })
      .catch(() => setStatus(prev => prev ?? "active"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, STATUS_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return { status, openingTime, closingTime, loading };
}

function useMenuItems() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchMenu = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(
        `${PAYLOAD_API}/api/menu?where[available][equals]=true&depth=1&limit=100`,
        { headers: { "Content-Type": "application/json" }, mode: "cors" }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setItems((data.docs || []).map(doc => {
        let imgUrl = FALLBACK_IMAGES[doc.category] || FALLBACK_IMAGES["default"];
        if (doc.image?.url) {
          imgUrl = doc.image.url.startsWith("http") ? doc.image.url : `${PAYLOAD_API}${doc.image.url}`;
        }
        return {
          id: doc.id, name: doc.name, description: doc.description || "",
          price: `₹${doc.price}`, veg: doc.veg, isPopular: doc.isPopular,
          category: doc.category, cuisine: categoryLabels[doc.category] || doc.category,
          img: imgUrl, fallbackImg: FALLBACK_IMAGES[doc.category] || FALLBACK_IMAGES["default"],
        };
      }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMenu(); }, []);
  return { items, loading, error, refetch: fetchMenu };
}

// ─── SMART IMAGE ─────────────────────────────────────────────────────────────
function SmartImage({ src, fallback, alt, className }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [status, setStatus] = useState("loading");
  const imgRef = useRef(null);

  useEffect(() => { setImgSrc(src); setStatus("loading"); }, [src]);
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) setStatus("loaded");
  }, [imgSrc]);

  return (
    <>
      <div style={{ opacity: status === "loading" ? 1 : 0, transition: "opacity 0.6s ease", pointerEvents: "none" }} />
      <img
        ref={imgRef}
        className={`${className} ${status === "loaded" ? "loaded" : "loading"}`}
        src={imgSrc} alt={alt} loading="lazy"
        onLoad={() => setStatus("loaded")}
        onError={() => { if (imgSrc !== fallback) { setImgSrc(fallback); setStatus("loading"); } else setStatus("loaded"); }}
        style={{
          opacity: status === "loaded" ? 1 : 0,
          filter: status === "loaded" ? "blur(0px) saturate(1)" : "blur(6px) saturate(0.4)",
          transition: status === "loaded" ? "opacity 0.7s cubic-bezier(0.22,1,0.36,1), filter 0.7s cubic-bezier(0.22,1,0.36,1)" : "none",
        }}
      />
    </>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return <div className="toast"><span className="toast-icon">{toast.icon}</span>{toast.msg}</div>;
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ sectionRefs }) {
  const [active, setActive]     = useState("Home");
  const [scrolled, setScrolled] = useState(false);
  const navigate                = useNavigate();

  const links = [
    { label: "Home",     ref: sectionRefs.home },
    { label: "Menu",     ref: sectionRefs.menu },
    { label: "About",    ref: sectionRefs.about },
    { label: "Gallery",  ref: sectionRefs.gallery },
    { label: "Branches", ref: sectionRefs.branches },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (label, ref) => {
    setActive(label);
    ref?.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const obs = links.map(({ label, ref }) => {
      if (!ref?.current) return null;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(label); },
        { threshold: 0.35 }
      );
      o.observe(ref.current);
      return o;
    });
    return () => obs.forEach(o => o?.disconnect());
  }, []);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="logo-wrap">
        <img src="/images/planet-logo-transparent.png" alt="Planet Restaurant" className="nav-logo-img" />
      </div>
      <ul className="nav-links">
        {links.map(({ label, ref }) => (
          <li key={label}>
            <a className={active === label ? "active" : ""} onClick={() => scrollTo(label, ref)}>{label}</a>
          </li>
        ))}
      </ul>
      <button className="nav-btn" onClick={() => navigate("/corner")}>Planet Corner</button>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ isOpen, hoursText, statusLoading }) {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />

      {/* Status badge */}
      {!statusLoading && (
        <div className={`hero-badge ${isOpen ? "" : "closed"}`}>
          <span className="badge-dot" />
          {isOpen ? `Open Now · ${hoursText}` : "Currently Closed"}
        </div>
      )}

      <p className="hero-eyebrow">Planet Multi-Cuisine Restaurant · Kayamkulam</p>

      <h1>
        Where Every Meal
        <em>Tells a Story</em>
      </h1>

      <div className="hero-divider" />

      <p className="hero-desc">
        From the spice trails of Kerala to the kitchens of the world —
        authentic flavors, master chefs, and memories that last a lifetime.
      </p>

      <div className="hero-btns">
        <button className="btn-primary" onClick={() => navigate("/menu")}>
          Explore Our Menu
        </button>
        <button className="btn-ghost" onClick={() => navigate("/corner")}>
          Visit Planet Corner ↗
        </button>
      </div>

      {/* Cuisine strip */}
      <div className="hero-cuisine-strip">
        {[
          { icon: "🌴", label: "Kerala" },
          { icon: "🍚", label: "Biryani" },
          { icon: "🦞", label: "Seafood" },
          { icon: "🍛", label: "North Indian" },
          { icon: "🥡", label: "Chinese" },
          { icon: "🍽️", label: "Continental" },
        ].map((c, i, arr) => (
          <>
            <div className="cuisine-pill" key={c.label}>
              <span className="cuisine-pill-icon">{c.icon}</span>
              {c.label}
            </div>
            {i < arr.length - 1 && <div className="cuisine-sep" key={`sep-${i}`} />}
          </>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="hero-scroll-arrow" />
      </div>
    </section>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function Stats() {
  const ref = useScrollFade();
  return (
    <div className="stats scroll-fade" ref={ref}>
      {[["200+","Menu Items"],["15+","Years of Taste"],["50k+","Happy Customers"],["4.9★","Average Rating"]].map(([num, label]) => (
        <div className="stat" key={label}>
          <span className="stat-num">{num}</span>
          <span className="stat-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MENU SECTION ─────────────────────────────────────────────────────────────
function MenuSection({ toastShow }) {
  const ref = useScrollFade();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [liked, setLiked] = useState({});
  const { items, loading, error, refetch } = useMenuItems();

  const filtered = activeTab === "all" ? items : items.filter(i => i.category === activeTab);
  const visible  = filtered.slice(0, 8);

  const toggleLike = (id, name) => {
    setLiked(p => {
      const next = { ...p, [id]: !p[id] };
      toastShow(next[id] ? `Added "${name}" to favourites` : "Removed from favourites", next[id] ? "❤️" : "🤍");
      return next;
    });
  };

  return (
    <section className="section scroll-fade" ref={ref}>
      <div className="section-header">
        <div>
          <p className="section-label">Our Specialties</p>
          <h2 className="section-title">Indulge in<br />Culinary Artistry</h2>
        </div>
        <p className="section-desc">Explore our finest selections, crafted to perfection by our world-class chefs.</p>
      </div>
      <div className="menu-tabs">
        {tabs.map(tab => (
          <button key={tab.value} className={`tab ${activeTab === tab.value ? "active" : ""}`} onClick={() => setActiveTab(tab.value)}>
            {tab.label}
          </button>
        ))}
      </div>
      {loading && <div className="menu-loading"><div className="spinner" /><p>Loading dishes...</p></div>}
      {!loading && error && <div className="menu-error"><p>⚠ Could not load menu — {error}</p><button onClick={refetch}>Try Again</button></div>}
      {!loading && !error && filtered.length === 0 && <div className="menu-empty">No dishes found in this category.</div>}
      {!loading && !error && visible.length > 0 && (
        <>
          <div className="menu-grid">
            {visible.map((item, idx) => (
              <div className="menu-card" key={item.id} style={{ animationDelay: `${idx * 0.1}s` }}>
                {item.isPopular && <span className="popular-tag">⭐ Popular</span>}
                <div className="plate-img-wrap">
                  <SmartImage className="plate-img" src={item.img} fallback={item.fallbackImg} alt={item.name} />
                </div>
                <button className={`heart-btn ${liked[item.id] ? "liked" : ""}`} onClick={() => toggleLike(item.id, item.name)}>
                  {liked[item.id] ? "♥" : "♡"}
                </button>
                <p className="card-cuisine">{item.cuisine}</p>
                <h3 className="card-name">{item.name}</h3>
                <p className="card-desc">{item.description}</p>
                <div className="menu-card-footer">
                  <span className="menu-price">{item.price}</span>
                  <span className={`veg-badge ${item.veg ? "veg" : "nonveg"}`}>{item.veg ? "🟢" : "🔴"}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="show-more-wrap">
            <button className="show-more-btn" onClick={() => navigate("/menu")}>
              <span>View Full Menu</span>
              <span className="show-more-icon">→</span>
            </button>
          </div>
        </>
      )}
    </section>
  );
}

// ─── OUR STORY ────────────────────────────────────────────────────────────────
function OurStory() {
  const ref = useScrollFade();
  const pillars = [
    { icon: "🌾", title: "Local Roots",       text: "Ingredients sourced fresh every morning from Kerala's finest farms." },
    { icon: "🌏", title: "Global Soul",        text: "Authentic recipes brought home by chefs from 6+ countries." },
    { icon: "❤️",  title: "Made with Love",    text: "Every plate carries the warmth of a home-cooked meal." },
    { icon: "✨", title: "Memorable Moments", text: "50,000+ happy guests and counting — your table is waiting." },
  ];
  return (
    <section className="story scroll-fade" ref={ref}>
      <div className="story-grid">
        <div className="story-visual">
          <div className="story-badge">
            <span className="story-badge-num">15+</span>
            <span className="story-badge-text">Years of<br />Culinary Craft</span>
          </div>
        </div>
        <div>
          <p className="section-label">
  Best Family Restaurant in Kayamkulam
</p>
          <p className="section-label">Our Story</p>
          <h2>A Journey of<br /><em>Flavor &amp; Passion</em></h2>
          <p>Planet began as a humble dream in the heart of Perumbavoor — a small kitchen with big ambitions. What started as a love letter to Kerala's traditional flavors slowly grew into a celebration of global cuisines, served under one warm, golden roof.</p>
          <p>Every dish we serve is a story — of hand-picked spices from local farms, of chefs trained across continents, and of families who've chosen us to be part of their most treasured moments.</p>
          <div className="story-pillars">
            {pillars.map(p => (
              <div className="pillar" key={p.title}>
                <span className="pillar-icon">{p.icon}</span>
                <div className="pillar-title">{p.title}</div>
                <p className="pillar-text">{p.text}</p>
              </div>
            ))}
          </div>
          <p className="chef-signature">— Chef Rajeev Menon</p>
          <p className="chef-role">Founder &amp; Executive Chef</p>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────────
function Features() {
  const ref = useScrollFade();
  return (
    <div className="features scroll-fade" ref={ref}>
      <div style={{ textAlign: "center" }}>
        <p className="section-label">Why Choose Planet</p>
        <h2 className="section-title">A Dining Experience<br />Like No Other</h2>
      </div>
      <div className="features-grid">
        {features.map(f => (
          <div className="feature-card" key={f.title}>
            <span className="feature-icon">{f.icon}</span>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-text">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GALLERY — real food images ───────────────────────────────────────────────
function Gallery() {
  const ref = useScrollFade();
  return (
    <section className="section scroll-fade" ref={ref}>
      <div className="section-header">
        <div>
          <p className="section-label">Food Gallery</p>
          <h2 className="section-title">A Feast for<br />Your Eyes</h2>
        </div>
        <p className="section-desc">Every dish is a masterpiece — crafted to delight all your senses.</p>
      </div>
      <div className="gallery-grid">
        {gallery.map(g => (
          <div className="gal-item" key={g.label}>
            <img className="gal-img" src={g.img} alt={g.label} loading="lazy" />
            <div className="gal-overlay" />
            <div className="gal-label">{g.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── BRANCHES ─────────────────────────────────────────────────────────────────
function Branches({ branchesRef }) {
  const ref = useScrollFade();
  const navigate = useNavigate();
  return (
    <section className="branches scroll-fade" ref={ref}>
      <div ref={branchesRef} />
      <div style={{ textAlign: "center" }}>
        <p className="section-label">Our Locations</p>
        <h2 className="section-title">Two Branches,<br />One Planet</h2>
      </div>
      <div className="branches-grid">
        <div className="branch-card">
          <span className="branch-tag">Main Branch</span>
          <h3 className="branch-name">Planet</h3>
          <p className="branch-sub">Multi Cuisine Restaurant</p>
          <div className="branch-info">
            <div className="branch-row"><span><i className="fas fa-location-dot" /></span>Near Town Hall, Perumbavoor, Kerala</div>
            <div className="branch-row"><span><i className="fas fa-phone" /></span>+91 98765 43210</div>
            <div className="branch-row"><span><i className="fas fa-clock" /></span>11:00 AM – 11:00 PM, Daily</div>
          </div>
          <button className="branch-visit-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            You're here ✓
          </button>
        </div>
        <div className="branch-card">
          <span className="branch-tag">Second Branch</span>
          <h3 className="branch-name">Planet Corner</h3>
          <p className="branch-sub">Kochi Outlet</p>
          <div className="branch-info">
           <div className="branch-row"><span><i className="fas fa-location-dot" /></span>Elamkulam, Kochi, Kerala</div>
<div className="branch-row"><span><i className="fas fa-phone" /></span>+91 85904 11348</div>
<div className="branch-row"><span><i className="fas fa-clock" /></span>11:00 AM – 11:00 PM, Daily</div>
          </div>
          <button className="branch-visit-btn" onClick={() => navigate("/corner")}>
            Visit Planet Corner →
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer({ sectionRefs }) {
  const scrollTo = ref => ref?.current?.scrollIntoView({ behavior: "smooth" });
  const quickLinks = [
    { label: "Home",     ref: sectionRefs.home },
    { label: "Our Menu", ref: sectionRefs.menu },
    { label: "About Us", ref: sectionRefs.about },
    { label: "Gallery",  ref: sectionRefs.gallery },
    { label: "Branches", ref: sectionRefs.branches },
  ];
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo-wrap">
            <img src="/images/planet-logo-transparent.png" alt="Planet Restaurant" className="nav-logo-img" />
          </div>
          <p>Where every meal is a journey around the world. Fresh ingredients, master chefs, and unforgettable flavors — only at Planet.</p>
          <div className="social-links">
            <a className="social-btn" href="https://instagram.com/planetrestaurantperumbavoor" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram" /></a>
<a className="social-btn" href="https://facebook.com/planetrestaurantperumbavoor" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f" /></a>
<a className="social-btn" href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp" /></a>
<a className="social-btn" href="tel:+919876543210"><i className="fas fa-phone" /></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            {quickLinks.map(({ label, ref }) => (
              <li key={label}><a onClick={() => scrollTo(ref)}>{label}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Cuisine</h4>
          <ul>
            {["Kerala Specials","North Indian","Chinese","Continental","Seafood"].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Our Branches</h4>
          <ul>
            <li><div className="footer-hours-badge"><span className="footer-hours-dot" /> Open Daily</div></li>
           <li style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}><i className="fas fa-clock" /> 11:00 AM – 11:00 PM</li>
<li><a href="..."><i className="fas fa-location-dot" /> Planet — Perumbavoor </a></li>
<li><a href="..."><i className="fas fa-location-dot" /> Planet Corner — Kochi </a></li>
<li><a href="tel:+919876543210"><i className="fas fa-phone" /> +91 98765 43210</a></li>
<li><a href="tel:+918590411348"><i className="fas fa-phone" /> +91 85904 11348</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-divider" />
      <div className="footer-bottom">
        <p>© 2025 Planet Multi Cuisine Restaurant. All rights reserved.</p>
        <div className="social-links">
         <a className="social-btn" href="https://instagram.com/planetrestaurantperumbavoor" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram" /></a>
<a className="social-btn" href="https://facebook.com/planetrestaurantperumbavoor" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f" /></a>
<a className="social-btn" href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp" /></a>
<a className="social-btn" href="tel:+919876543210"><i className="fas fa-phone" /></a>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
function PlanetRestaurant() {
  const sectionRefs = {
    home:     useRef(null),
    menu:     useRef(null),
    about:    useRef(null),
    gallery:  useRef(null),
    branches: useRef(null),
  };
  const { toast, show: toastShow } = useToast();
  const { status, openingTime, closingTime, loading: statusLoading } = useRestaurantStatus();

  const isOpen    = status === "active";
  const hoursText = openingTime && closingTime ? `${openingTime} – ${closingTime}` : "11:00 AM – 11:00 PM";

  return (
    <>
      <style>{styles}</style>
      <div className="planet-site">
        <Navbar sectionRefs={sectionRefs} />
        <div ref={sectionRefs.home}>
          <Hero isOpen={isOpen} hoursText={hoursText} statusLoading={statusLoading} />
        </div>
        <Stats />
        <div ref={sectionRefs.menu}><MenuSection toastShow={toastShow} /></div>
        <div ref={sectionRefs.about}><OurStory /><Features /></div>
        <div ref={sectionRefs.gallery}><Gallery /></div>
        <div ref={sectionRefs.branches}><Branches branchesRef={sectionRefs.branches} /></div>
        <Footer sectionRefs={sectionRefs} />
        <Toast toast={toast} />
      </div>
    </>
  );
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<PlanetRestaurant />} />
      <Route path="/menu"         element={<Menu />} />
      <Route path="/corner"       element={<PlanetCorner />} />
      <Route path="/corner/items" element={<MenuPage />} />
    </Routes>
  );
}