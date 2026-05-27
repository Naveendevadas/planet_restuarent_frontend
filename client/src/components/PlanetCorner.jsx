

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PAYLOAD_API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function menuImageUrl(image, apiBase) {
  if (!image?.url && !image?.filename) return null;
  if (image.url && !image.url.includes("undefined.s3.")) {
    return image.url.startsWith("http") ? image.url : `${apiBase}${image.url}`;
  }
  if (!image.filename) return null;
  const path = image.prefix ? `${image.prefix}/${image.filename}` : image.filename;
  return `${apiBase}/api/media/file/${path.split("/").map(encodeURIComponent).join("/")}`;
}

const PLANET_CORNER_RESTAURANT_ID = "6a0c309cc802dc1b90cf0bbb";

// ─── COMPREHENSIVE CATEGORY CONFIG ───────────────────────────────────────────
// Covers both dessert-style and full-meal categories — whatever the backend returns
const CATEGORY_CONFIG = {
  // Dessert / café style
  // "ice-cream":  { label: "Ice Creams",          icon: "🍦" },
  // "pastries":   { label: "Pastries & Cakes",     icon: "🧁" },
  // "shakes":     { label: "Milkshakes",           icon: "🥤" },
  // "desserts":   { label: "Desserts",             icon: "🍮" },
  // "waffles":    { label: "Waffles & Pancakes",   icon: "🥞" },
  // "coffee":     { label: "Coffee & Hot Drinks",  icon: "☕" },
  // "snacks":     { label: "Snacks & Bites",       icon: "🍿" },
  // // Full-meal categories (matches Planet main restaurant style)
  "kerala":       { label: "Kerala Specials",    icon: "🌴" },
  "biryani":      { label: "Biryani & Rice",     icon: "🍚" },
  "starters":     { label: "Starters",           icon: "🥗" },
  "north-indian": { label: "North Indian",       icon: "🍛" },
  "seafood":      { label: "Seafood",            icon: "🦞" },
  "chinese":      { label: "Chinese",            icon: "🥡" },
  "continental":  { label: "Continental",        icon: "🍽️" },
  "soups":        { label: "Soups",              icon: "🍲" },
  "breads":       { label: "Breads",             icon: "🫓" },
  "salads":       { label: "Salads",             icon: "🥙" },
  "juices":       { label: "Juices",             icon: "🧃" },
  "beverages":    { label: "Beverages",          icon: "🥛" },
  "pizza":        { label: "Pizza",              icon: "🍕" },
  "burgers":      { label: "Burgers",            icon: "🍔" },
  "sandwiches":   { label: "Sandwiches",         icon: "🥪" },
  "noodles":      { label: "Noodles",            icon: "🍜" },
  "rolls":        { label: "Rolls & Wraps",      icon: "🌯" },
  "meals":        { label: "Meals",              icon: "🍱" },
};

const FALLBACK_IMAGES = {
  "ice-cream":    "https://picsum.photos/seed/icecream/400/400",
  "pastries":     "https://picsum.photos/seed/pastries/400/400",
  "shakes":       "https://picsum.photos/seed/milkshake/400/400",
  "desserts":     "https://picsum.photos/seed/desserts/400/400",
  "waffles":      "https://picsum.photos/seed/waffles/400/400",
  "coffee":       "https://picsum.photos/seed/coffee/400/400",
  "snacks":       "https://picsum.photos/seed/snacks/400/400",
  "kerala":       "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80",
  "biryani":      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
  "starters":     "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80",
  "north-indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80",
  "seafood":      "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=400&q=80",
  "chinese":      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=400&q=80",
  "continental":  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80",
  "default":      "https://picsum.photos/seed/food/400/400",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');
  *,::before,::after{margin:0;padding:0;box-sizing:border-box}
  :root{--green:#1a3828;--green-dark:#0f2118;--gold:#f0b429}
  body{background:#0f2118;margin:0;padding:0;overflow-x:hidden}
#root{width:100%!important;max-width:100%!important;margin:0!important;padding:0!important;text-align:left!important;border:none!important;box-sizing:border-box!important}
  .corner-site{background:#0f2118;color:#fff;font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden}

  /* NAV */
  .corner-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.2rem 4rem;background:rgba(15,33,24,0.9);backdrop-filter:blur(14px);border-bottom:1px solid rgba(240,180,41,0.15)}
  .corner-nav .logo-wrap{display:flex;align-items:center;gap:12px}
  .corner-nav .logo-icon{width:42px;height:42px;background:#f0b429;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#0f2118;line-height:1.2;text-align:center;letter-spacing:-0.5px}
  // .corner-nav .logo-text{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:#f0b429;letter-spacing:2px;display:block}
  .corner-nav .logo-sub{font-size:0.6rem;color:rgba(240,180,41,0.7);letter-spacing:3px;text-transform:uppercase;display:block;margin-top:-2px}
  
  .back-btn{background:#f0b429;color:#0f2118;border:none;padding:0.6rem 1.4rem;border-radius:50px;font-family:'DM Sans',sans-serif;font-weight:500;font-size:0.88rem;cursor:pointer;transition:all 0.25s;letter-spacing:0.3px;position:relative;overflow:hidden}
  .back-btn:hover{background:#f5c842;transform:scale(1.04);box-shadow:0 6px 20px rgba(240,180,41,0.4)}

  /* HERO */
  .corner-hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:9rem 2rem 6rem;position:relative;overflow:hidden;isolation:isolate}
  .corner-hero-bg{position:absolute;inset:0;background-image:url('/images/interior.jpg');background-size:cover;background-position:center;filter:blur(1px) saturate(0.8);transform:scale(1.1);z-index:-3}
  .corner-hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,33,24,0.92) 0%,rgba(15,33,24,0.72) 45%,rgba(15,33,24,0.97) 100%);z-index:-2}
  .corner-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(240,180,41,0.12);border:1px solid rgba(240,180,41,0.35);padding:0.45rem 1.1rem;border-radius:50px;font-size:0.72rem;letter-spacing:2px;text-transform:uppercase;color:#f5c842;margin-bottom:1.5rem;backdrop-filter:blur(10px)}
  .corner-badge.closed{background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.35);color:#f87171}
  .badge-dot{width:6px;height:6px;background:#f0b429;border-radius:50%;display:inline-block;box-shadow:0 0 10px #f0b429;animation:pulse 1.8s infinite}
  .corner-badge.closed .badge-dot{background:#f87171;box-shadow:0 0 10px #f87171}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}

  .corner-hero h1{font-family:'Playfair Display',serif;font-size:4.2rem;font-weight:900;line-height:1.05;margin-bottom:0.3rem;animation:fadeUp 0.8s 0.1s ease both}
  .corner-hero h1 br+em,.corner-hero h1 em{font-style:normal;display:block;font-size:1.8rem;font-weight:400;letter-spacing:3px;background:linear-gradient(270deg,#f0b429,#fce08a,#f0b429);background-size:400% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite,fadeUp 0.8s 0.2s ease both;margin-top:0.4rem}
  .hero-tagline{color:rgba(255,255,255,0.65);font-size:1.05rem;max-width:520px;line-height:1.7;animation:fadeUp 0.8s 0.25s ease both}
  .gold-divider{width:60px;height:3px;background:linear-gradient(90deg,#f0b429,#fce08a);border-radius:2px;margin:1.8rem auto}
  .hero-feature-strip{display:flex;align-items:center;gap:0;margin:2.2rem 0 2rem;background:rgba(255,255,255,0.04);border:1px solid rgba(240,180,41,0.18);border-radius:60px;padding:0.5rem 0.5rem;backdrop-filter:blur(12px);animation:fadeUp 0.8s 0.4s ease both}
  .hero-feature-item{display:flex;align-items:center;gap:10px;padding:0.7rem 1.6rem;border-radius:50px;transition:all 0.3s}
  .hero-feature-item:hover{background:rgba(240,180,41,0.1)}
  .hero-feature-icon{font-size:1.5rem;line-height:1}
  .hero-feature-label{font-size:0.8rem;font-weight:500;color:rgba(255,255,255,0.8);white-space:nowrap}
  .hero-feature-sep{width:1px;height:28px;background:rgba(240,180,41,0.2);flex-shrink:0}
  .hero-about-desc{max-width:600px;color:rgba(255,255,255,0.5);font-size:0.92rem;line-height:1.85;animation:fadeUp 0.8s 0.55s ease both;position:relative;padding:1.6rem 2rem;margin-top:0.5rem}
  .hero-about-desc::before,.hero-about-desc::after{content:'"';font-family:'Playfair Display',serif;font-size:4rem;color:rgba(240,180,41,0.15);position:absolute;line-height:1}
  .hero-about-desc::before{top:0;left:0}
  .hero-about-desc::after{bottom:-1rem;right:0;content:'"'}
  .hero-scroll-hint{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0.35;animation:fadeUp 1s 1s ease both}
  .hero-scroll-hint span{font-size:0.65rem;letter-spacing:3px;text-transform:uppercase}
  .scroll-arrow{width:20px;height:20px;border-right:2px solid #f0b429;border-bottom:2px solid #f0b429;transform:rotate(45deg);animation:bounce 1.8s ease-in-out infinite}
  .hero-map-btn{display:inline-flex;align-items:center;gap:8px;background:#f0b429;color:#0f2118;border:none;padding:0.75rem 1.8rem;border-radius:50px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:0.88rem;cursor:pointer;text-decoration:none;transition:all 0.3s;animation:fadeUp 0.8s 0.65s ease both;margin-top:1.2rem;box-shadow:0 8px 28px rgba(240,180,41,0.28)}
  .hero-map-btn:hover{background:#f5c842;transform:translateY(-3px) scale(1.04);box-shadow:0 16px 40px rgba(240,180,41,0.4)}
  .hero-map-btn svg{width:16px;height:16px;flex-shrink:0}

  /* INFO CARDS */
  .corner-info{padding:4rem;background:#0f2118}
  .info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;max-width:1100px;margin:0 auto}
  .info-card{background:linear-gradient(180deg,#1e2e22 0%,#182520 100%);border:1px solid rgba(240,180,41,0.15);border-radius:24px;padding:2.5rem 2rem;text-align:center;transition:all 0.4s cubic-bezier(0.22,1,0.36,1);position:relative;overflow:hidden}
  .info-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(240,180,41,0.06),transparent);opacity:0;transition:opacity 0.3s}
  .info-card:hover::before{opacity:1}
  .info-card:hover{transform:translateY(-8px);border-color:rgba(240,180,41,0.45);box-shadow:0 25px 60px rgba(0,0,0,0.4)}
  .info-icon{font-size:2.5rem;margin-bottom:1.2rem;display:block}
  .info-label{font-size:0.7rem;letter-spacing:3px;text-transform:uppercase;color:#f0b429;margin-bottom:0.6rem;font-weight:500}
  .info-value{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:#fff;line-height:1.4}
  .info-sub{font-size:0.82rem;color:rgba(255,255,255,0.45);margin-top:0.4rem;line-height:1.5}

  /* MENU SECTION */
  .corner-menu-section{padding:5rem 4rem;background:#0f2118}
.menu-section-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:3rem;width:100%}
  .section-label{font-size:0.75rem;letter-spacing:3px;text-transform:uppercase;color:#f0b429;margin-bottom:0.5rem}
  .section-title{font-family:'Playfair Display',serif;font-size:2.6rem;font-weight:700;line-height:1.2}
  .menu-section-desc{color:rgba(255,255,255,0.45);font-size:0.9rem;max-width:280px;text-align:right;line-height:1.6}

  /* TABS */
  .menu-tabs{display:flex;gap:0.5rem;margin-bottom:4.5rem;flex-wrap:wrap}
  .c-tab{background:transparent;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);padding:0.5rem 1.2rem;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:0.85rem;cursor:pointer;transition:all 0.25s;display:flex;align-items:center;gap:6px;white-space:nowrap}
  .c-tab.active,.c-tab:hover{background:#f0b429;color:#0f2118;border-color:#f0b429;font-weight:500;transform:translateY(-2px);box-shadow:0 6px 20px rgba(240,180,41,0.25)}
  .view-menu-btn{background:#f0b429;color:#0f2118;border:none;padding:0.55rem 1.3rem;border-radius:50px;font-weight:700;cursor:pointer;transition:0.3s;font-family:'DM Sans',sans-serif;font-size:0.85rem}
  .view-menu-btn:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(240,180,41,0.25)}

  /* MENU GRID */
  .menu-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;row-gap:7rem;padding-top:6rem}
  .menu-card{position:relative;background:linear-gradient(180deg,#1e2e22 0%,#182520 100%);border-radius:24px;padding:6rem 1.3rem 1.6rem;border:1px solid rgba(240,180,41,0.12);text-align:center;overflow:visible;cursor:pointer;transition:transform 0.55s cubic-bezier(0.22,1,0.36,1),border-color 0.4s,box-shadow 0.55s cubic-bezier(0.22,1,0.36,1),background 0.4s;animation:fadeUp 0.6s ease both}
  .menu-card:hover{transform:translateY(-14px) scale(1.012);border-color:rgba(240,180,41,0.55);background:linear-gradient(180deg,#223323 0%,#1b2a22 100%);box-shadow:0 25px 55px rgba(0,0,0,0.45),0 0 0 1px rgba(240,180,41,0.2)}
  .plate-img-wrap{position:absolute;top:-75px;left:50%;transform:translateX(-50%);width:160px;height:160px;border-radius:50%;overflow:hidden;box-shadow:0 20px 45px rgba(0,0,0,0.5),0 0 0 5px rgba(15,33,24,0.9),0 0 0 6px rgba(240,180,41,0.15);transition:transform 0.7s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.7s}
  .menu-card:hover .plate-img-wrap{transform:translateX(-50%) translateY(-14px) scale(1.18);box-shadow:0 35px 70px rgba(0,0,0,0.7),0 0 0 5px rgba(15,33,24,0.9),0 0 0 9px rgba(240,180,41,0.55)}
  .plate-img{width:100%;height:100%;object-fit:cover;border-radius:50%;transition:transform 0.7s,filter 0.7s}
  .menu-card:hover .plate-img{transform:scale(1.12);filter:brightness(1.1) saturate(1.2)}
  .popular-tag{position:absolute;top:1rem;left:1rem;background:#f0b429;color:#0f2118;font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:50px;letter-spacing:1px;text-transform:uppercase}
  .heart-btn{position:absolute;top:1rem;right:1rem;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.25s;font-size:0.9rem}
  .heart-btn:hover,.heart-btn.liked{color:#ff5a7a;border-color:rgba(255,90,122,0.5);background:rgba(255,90,122,0.1)}
  .card-cuisine{font-size:0.65rem;letter-spacing:2.5px;text-transform:uppercase;color:#f0b429;margin-bottom:0.45rem;font-weight:500}
  .card-name{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;margin-bottom:0.5rem}
  .card-desc{font-size:0.8rem;color:rgba(255,255,255,0.5);line-height:1.55;margin-bottom:1rem;min-height:2.5rem}
  .card-footer{display:flex;align-items:center;justify-content:space-between;padding-top:1rem;border-top:1px solid rgba(240,180,41,0.1)}
  .card-price{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:#f0b429}
  .veg-badge{font-size:0.75rem;padding:2px 8px;border-radius:50px;font-weight:500}
  .veg-badge.veg{background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3)}
  .veg-badge.nonveg{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)}
  .menu-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5rem 0;gap:1rem}
  .spinner{width:44px;height:44px;border:3px solid rgba(240,180,41,0.15);border-top-color:#f0b429;border-radius:50%;animation:spin 0.8s linear infinite}
  .menu-loading p{color:rgba(255,255,255,0.4);font-size:0.9rem;letter-spacing:1px}
  .menu-error{text-align:center;padding:4rem 0}
  .menu-error p{color:rgba(255,100,100,0.7);margin-bottom:1rem;font-size:0.9rem}
  .menu-error button{background:transparent;border:1px solid rgba(240,180,41,0.4);color:#f0b429;padding:0.5rem 1.4rem;border-radius:50px;cursor:pointer;font-size:0.85rem}
  .menu-empty{text-align:center;padding:4rem 0;color:rgba(255,255,255,0.3);font-size:0.95rem}

  /* FOOTER */
  .corner-footer{background:#0b1c13;border-top:1px solid rgba(240,180,41,0.12);padding:4rem 4rem 0}
  .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;max-width:1200px;margin:0 auto;padding-bottom:3.5rem}
  .footer-brand .logo-wrap{display:flex;align-items:center;gap:12px;margin-bottom:1.2rem}
  .footer-brand .logo-icon{width:42px;height:42px;background:#f0b429;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#0f2118;line-height:1.2;text-align:center;letter-spacing:-0.5px;flex-shrink:0}
  .footer-brand .logo-text{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:#f0b429;letter-spacing:2px;display:block}
  .footer-brand .logo-sub{font-size:0.6rem;color:rgba(240,180,41,0.6);letter-spacing:3px;text-transform:uppercase;display:block;margin-top:-2px}
  .footer-brand p{color:rgba(255,255,255,0.4);font-size:0.87rem;line-height:1.8;max-width:280px;margin-bottom:1.5rem}
  .footer-social{display:flex;gap:0.7rem}
  .social-btn{width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;text-decoration:none;transition:all 0.25s;font-size:1rem;color:rgba(255,255,255,0.55)}
  .social-btn:hover{border-color:rgba(240,180,41,0.5);background:rgba(240,180,41,0.1);transform:translateY(-3px);color:#f0b429}
  .footer-col h4{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;color:#f0b429;margin-bottom:1.2rem;letter-spacing:0.5px}
  .footer-col ul{list-style:none;display:flex;flex-direction:column;gap:0.65rem}
  .footer-col ul li{font-size:0.85rem;color:rgba(255,255,255,0.45);line-height:1.5}
  .footer-col ul li a{color:rgba(255,255,255,0.45);text-decoration:none;transition:color 0.2s}
  .footer-col ul li a:hover{color:#f0b429}
  .footer-col ul li strong{color:rgba(255,255,255,0.75);display:block;font-size:0.8rem;font-weight:500}
  .footer-hours-row{display:flex;flex-direction:column;gap:0.5rem}
  .hours-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25);border-radius:50px;padding:0.3rem 0.8rem;font-size:0.72rem;color:#4ade80;font-weight:500;margin-bottom:0.5rem;width:fit-content}
  .hours-badge.closed{background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.25);color:#f87171}
  .hours-badge-dot{width:5px;height:5px;background:#4ade80;border-radius:50%;animation:pulse 1.8s infinite}
  .hours-badge.closed .hours-badge-dot{background:#f87171}
  .footer-divider{max-width:1200px;margin:0 auto;height:1px;background:rgba(240,180,41,0.08)}
  .footer-bottom{max-width:1200px;margin:0 auto;padding:1.4rem 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
  .footer-bottom p{font-size:0.78rem;color:rgba(255,255,255,0.25)}
  .back-home-btn{background:transparent;border:1px solid rgba(240,180,41,0.3);color:#f0b429;padding:0.45rem 1.1rem;border-radius:50px;font-size:0.8rem;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif}
  .back-home-btn:hover{background:rgba(240,180,41,0.1);transform:translateY(-2px)}

  /* TOAST */
  .c-toast{position:fixed;bottom:2rem;right:2rem;background:#1e2e22;border:1px solid rgba(240,180,41,0.35);border-radius:14px;padding:0.9rem 1.4rem;display:flex;align-items:center;gap:10px;font-size:0.88rem;color:#fff;z-index:999;box-shadow:0 10px 40px rgba(0,0,0,0.4);animation:slideUp 0.4s ease}

/* ══════════════════════════════════════════
/* ── 1024px ── */
@media(max-width:1024px){
  .menu-grid{
    grid-template-columns:repeat(3,1fr);
    gap:2rem;
    row-gap:7rem;
    padding-top:6rem;
  }
}

/* ── 900px ── */
@media(max-width:900px){
  .corner-nav{padding:1rem 1.5rem}
  .corner-hero{padding:7rem 1.5rem 5rem}
  .corner-hero h1{font-size:2.5rem}
  .corner-hero h1 em{font-size:1.2rem}
  .hero-feature-strip{flex-wrap:wrap;border-radius:20px;padding:0.5rem;gap:0.3rem}
  .hero-feature-sep{display:none}
  .hero-feature-item{padding:0.5rem 1rem}
  .hero-about-desc{font-size:0.88rem;padding:1rem 1.4rem}
  .corner-menu-section{padding:3rem 1.5rem}
  .menu-section-header{flex-direction:column;align-items:flex-start;gap:1rem}
  .menu-section-desc{text-align:left;max-width:100%}
  .corner-footer{padding:3rem 1.5rem 0}
  .footer-grid{grid-template-columns:1fr 1fr;gap:2rem}
  .footer-brand{grid-column:1/-1}
  .footer-bottom{flex-direction:column;text-align:center}

  /* info cards — 3 col smaller */
  .corner-info{padding:2rem 1.5rem}
  .info-grid{grid-template-columns:repeat(3,1fr);gap:1rem}
  .info-card{padding:1.5rem 1rem;border-radius:18px;text-align:center}
  .info-icon{font-size:1.4rem;margin-bottom:0.6rem;display:block}
  .info-label{font-size:0.6rem;letter-spacing:2px;margin-bottom:0.3rem}
  .info-value{font-size:0.95rem}
  .info-sub{font-size:0.72rem}

  /* menu grid — 2 col */
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
  .card-price{font-size:1.1rem}
  .heart-btn{top:0.5rem;right:0.5rem;width:28px;height:28px;font-size:0.8rem}
  .popular-tag{top:0.5rem;left:0.5rem;font-size:0.55rem}
}

/* ── 600px — info cards go single column ── */
@media(max-width:600px){
  .corner-info{padding:1.5rem 1rem}
  .info-grid{
    grid-template-columns:1fr !important;
    gap:0.8rem;
  }
  .info-card{
    padding:1rem 1.2rem;
    border-radius:16px;
    display:flex;
    flex-direction:row;
    align-items:center;
    gap:1rem;
    text-align:left;
  }
  .info-icon{
    font-size:1.4rem;
    margin-bottom:0;
    flex-shrink:0;
    width:32px;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .info-label{font-size:0.6rem;letter-spacing:2px;margin-bottom:0.15rem}
  .info-value{font-size:0.9rem;line-height:1.3}
  .info-sub{font-size:0.7rem;margin-top:0.15rem}
}

/* ── 480px — menu single column ── */
@media(max-width:480px){
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
  .card-price{font-size:1.1rem}
  .heart-btn{top:0.5rem;right:0.5rem;width:28px;height:28px;font-size:0.8rem}
  .popular-tag{top:0.5rem;left:0.5rem;font-size:0.55rem}
}
`;

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, icon = "✅") => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

const STATUS_REFRESH_MS = 30_000;

function useRestaurantStatus() {
  const [status,      setStatus]      = useState(null);
  const [openingTime, setOpeningTime] = useState(null);
  const [closingTime, setClosingTime] = useState(null);
  const [loading,     setLoading]     = useState(true);

  const fetchStatus = () => {
    fetch(
      `${PAYLOAD_API}/api/restaurant/${PLANET_CORNER_RESTAURANT_ID}`,
      { headers: { "Content-Type": "application/json" } }
    )
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

// ─── MENU HOOK — fetches items & derives categories dynamically ───────────────
function useMenuItems() {
  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]); // derived from actual data
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${PAYLOAD_API}/api/menu?where[restaurants][in]=${PLANET_CORNER_RESTAURANT_ID}&depth=1&limit=200`,
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      const docs = data.docs || [];

      // Build items array
      const mapped = docs.map(doc => {
        const uploaded = menuImageUrl(doc.image, PAYLOAD_API);
        const fallback = FALLBACK_IMAGES[doc.category] || FALLBACK_IMAGES["default"];
        return {
          id:          doc.id,
          name:        doc.name,
          description: doc.description || "",
          price:       `₹${doc.price}`,
          veg:         doc.veg,
          isDrink:     doc.isDrink ?? false,
          isPopular:   doc.isPopular,
          category:    doc.category,
          // Use config label if known, else humanize the raw value
          cuisine: CATEGORY_CONFIG[doc.category]?.label
            || doc.category?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
            || "Other",
          img:         uploaded || fallback,
          fallbackImg: fallback,
        };
      });

      setItems(mapped);

      // Derive unique ordered categories that actually exist in this restaurant's menu
      const seen = new Set();
      const derived = [];
      docs.forEach(doc => {
        if (doc.category && !seen.has(doc.category)) {
          seen.add(doc.category);
          const cfg = CATEGORY_CONFIG[doc.category];
          derived.push({
            value: doc.category,
            label: cfg?.label || doc.category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            
          });
        }
      });

      setCategories(derived);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);
  return { items, categories, loading, error, refetch: fetchMenu };
}

// ─── MENU SECTION ─────────────────────────────────────────────────────────────
function MenuSection({ toastShow }) {
  const navigate  = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [liked,     setLiked]     = useState({});

  const { items, categories, loading, error, refetch } = useMenuItems();

  // Reset tab to "all" if current tab no longer exists after a refetch
  useEffect(() => {
    if (activeTab !== "all" && categories.length > 0) {
      const exists = categories.some(c => c.value === activeTab);
      if (!exists) setActiveTab("all");
    }
  }, [categories]);

  const filtered = activeTab === "all" ? items : items.filter(i => i.category === activeTab);

  const toggleLike = (id, name) => {
    setLiked(p => {
      const next = { ...p, [id]: !p[id] };
      toastShow(next[id] ? `Added "${name}" to favourites` : "Removed from favourites", next[id] ? "❤️" : "🤍");
      return next;
    });
  };

  // Build dynamic description from actual categories
  const categoryNames = categories.map(c => c.label);
  const menuDesc = categoryNames.length > 0
    ? `${categoryNames.slice(0, 3).join(", ")}${categoryNames.length > 3 ? " & more" : ""} — made fresh daily at Planet Corner, Kochi.`
    : "Delicious dishes made fresh daily at Planet Corner, Kochi.";

  return (
    <section className="corner-menu-section">
      <div className="menu-section-header">
        <div>
          <p className="section-label">Our Menu</p>
          <h2 className="section-title">
            {categories.length > 0
              ? <>Our<br/>Specialities</>
              : <>Sweet<br/>Indulgences</>
            }
          </h2>
        </div>
        <p className="menu-section-desc">{menuDesc}</p>
      </div>

      {/* ── Dynamic Category Tabs — built entirely from backend data ── */}
      {!loading && !error && categories.length > 0 && (
        <div className="menu-tabs">
          {/* All tab always first */}
         <button
  className={`c-tab ${activeTab === "all" ? "active" : ""}`}
  onClick={() => setActiveTab("all")}
>
  {/* <span>🍽️</span> */}
  All
</button>
          {/* One tab per category that actually exists in this restaurant */}
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`c-tab ${activeTab === cat.value ? "active" : ""}`}
              onClick={() => setActiveTab(cat.value)}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}

          {/* View Full Menu shortcut */}
          {items.length > 0 && (
            <button
              className="view-menu-btn"
              onClick={() => navigate("/corner/items")}
            >
              View Full Menu
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="menu-loading">
          <div className="spinner" />
          <p>Loading menu...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="menu-error">
          <p>⚠ Could not load menu — {error}</p>
          <button onClick={refetch}>Try Again</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="menu-empty">No items found in this category.</div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="menu-grid">
          {filtered.map((item, idx) => (
            <div
              className="menu-card"
              key={item.id}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {item.isPopular && <span className="popular-tag">⭐ Popular</span>}
              <div className="plate-img-wrap">
                <img
                  className="plate-img"
                  src={item.img}
                  alt={item.name}
                  loading="lazy"
                  onError={e => {
                    if (e.target.src !== item.fallbackImg) e.target.src = item.fallbackImg;
                  }}
                />
              </div>
              <button
                className={`heart-btn ${liked[item.id] ? "liked" : ""}`}
                onClick={() => toggleLike(item.id, item.name)}
              >
                {liked[item.id] ? "♥" : "♡"}
              </button>
              <p className="card-cuisine">{item.cuisine}</p>
              <h3 className="card-name">{item.name}</h3>
              <p className="card-desc">{item.description}</p>
              <div className="card-footer">
                <span className="card-price">{item.price}</span>
               {!item.isDrink && (
  <span className={`veg-badge ${item.veg ? "veg" : "nonveg"}`}>
    {item.veg ? "🟢" : "🔴"}
  </span>
)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function PlanetCorner() {
  const navigate = useNavigate();
  const { toast, show: toastShow } = useToast();
  const { status, openingTime, closingTime, loading: statusLoading } = useRestaurantStatus();

  const isOpen    = status === "active";
  const hoursText = openingTime && closingTime ? `${openingTime} – ${closingTime}` : "11:00 AM – 11:00 PM";

  return (
    <>
      <style>{styles}</style>
      <div className="corner-site">

        {/* NAV */}
       {/* NAV */}
<nav className="corner-nav">
  <div className="logo-wrap">
    <img src="/images/planet-logo-transparent (3).png" alt="Planet Corner Logo" style={{height: '43px', width: 'auto', objectFit: 'contain'}} />
    <img src="/images/planet-corner-logo-transparent-1.png" alt="Planet Corner" style={{height: '43px', width: 'auto', objectFit: 'contain'}} />
  </div>
  <button className="back-btn" onClick={() => navigate("/")}>Planet Multi Cuisine</button>
</nav>

        {/* HERO */}
        <section className="corner-hero">
          <div className="corner-hero-bg" aria-hidden="true" />
          <div className="corner-hero-overlay" aria-hidden="true" />

          {!statusLoading && (
            <div className={`corner-badge ${isOpen ? "" : "closed"}`}>
              <span className="badge-dot" />
              {isOpen ? "Now Open in Kochi" : "Currently Closed"}
            </div>
          )}

          <h1>
            Planet Corner
            <em>Elamkulam, Kochi</em>
          </h1>

          <div className="gold-divider" />

          <p className="hero-tagline">
            The same world-class flavors you love at Planet — now closer to the heart of Kochi.
          </p>

          {/* <div className="hero-feature-strip">
            <div className="hero-feature-item">
              <span className="hero-feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8 2 5 6 5 10c0 2.5 1.5 4.5 3 6l4 5 4-5c1.5-1.5 3-3.5 3-6 0-4-3-8-7-8z"/><circle cx="12" cy="10" r="2"/>
                </svg>
              </span>
              <span className="hero-feature-label">Creamy Ice Creams</span>
            </div>
            <div className="hero-feature-sep" />
            <div className="hero-feature-item">
              <span className="hero-feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 3v18"/>
                </svg>
              </span>
              <span className="hero-feature-label">Warm Waffles</span>
            </div>
            <div className="hero-feature-sep" />
            <div className="hero-feature-item">
              <span className="hero-feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
                </svg>
              </span>
              <span className="hero-feature-label">Freshly Brewed Coffee</span>
            </div>
            <div className="hero-feature-sep" />
            <div className="hero-feature-item">
              <span className="hero-feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M6 12v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-5"/><path d="M12 7V4"/><path d="M9 4h6"/>
                </svg>
              </span>
              <span className="hero-feature-label">Pastries & More</span>
            </div>
          </div> */}
  <a
            className="hero-map-btn"
            href="https://www.google.com/maps/search/Elamkulam+Kochi+Kerala"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Open in Google Maps
          </a>
          <p className="hero-about-desc">
            Planet Corner brings the same beloved experience to the vibrant streets of Elamkulam.
            Every bite is crafted with the same love that made Planet a household name in Perumbavoor.
          </p>

        

          <div className="hero-scroll-hint">
            <span>Scroll</span>
            <div className="scroll-arrow" />
          </div>
        </section>

        {/* INFO CARDS */}
        <section className="corner-info">
          <div className="info-grid">
            <div className="info-card">
              <span className="info-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <p className="info-label">Location</p>
              <p className="info-value">Elamkulam, Kochi</p>
              <p className="info-sub">Kerala, India</p>
            </div>
            <div className="info-card">
              <span className="info-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <p className="info-label">Phone</p>
              <p className="info-value">+91 85904 11348</p>
              <p className="info-sub">Call us anytime during hours</p>
            </div>
            <div className="info-card">
              <span className="info-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </span>
              <p className="info-label">Opening Hours</p>
              <p className="info-value">{hoursText}</p>
              <p className="info-sub">
                {statusLoading
                  ? "Checking status…"
                  : isOpen
                    ? <span style={{ color: '#4ade80', fontWeight: 600 }}>● Open now</span>
                    : <span style={{ color: '#f87171', fontWeight: 600 }}>● Currently closed</span>
                }
              </p>
            </div>
          </div>
        </section>

        {/* MENU */}
        <MenuSection toastShow={toastShow} />

        {/* FOOTER */}
        <footer className="corner-footer">
          <div className="footer-grid">
            <div className="footer-brand">
             <div className="logo-wrap">
  <img src="/images/planet-logo-transparent (3).png" alt="Planet Corner Logo" style={{height: '43px', width: 'auto', objectFit: 'contain'}} />
  <img src="/images/planet-corner-logo-transparent-1.png" alt="Planet Corner" style={{height: '43px', width: 'auto', objectFit: 'contain'}} />
</div>
              <p>A second home for sweet lovers in the heart of Elamkulam, Kochi. Same beloved flavours, same warmth — now closer to you.</p>
              <div className="footer-social">
                <a className="social-btn" href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a className="social-btn" href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a className="social-btn" href="https://wa.me/918590411348" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </a>
                <a className="social-btn" href="tel:+918590411348" title="Call Us">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>About Us</h4>
              <ul>
                <li>Planet Corner is the second branch of Planet Multi Cuisine Restaurant, Perumbavoor.</li>
                <li>We serve fresh, quality food crafted daily with the finest ingredients.</li>
                <li>Every item is made with the same love that made Planet a household name.</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Opening Hours</h4>
              <div className="footer-hours-row">
                <span className={`hours-badge ${isOpen ? "" : "closed"}`}>
                  <span className="hours-badge-dot" />
                  {statusLoading ? "Checking…" : isOpen ? "Open Now" : "Closed Now"}
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <strong style={{ color: '#f0b429', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Monday – Sunday</strong>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{hoursText}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <strong style={{ color: '#f0b429', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Public Holidays</strong>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{hoursText}</span>
                  </li>
                  <li style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    <span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'rgba(240,180,41,0.4)' }} />
                    Open every day of the year
                    <span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'rgba(240,180,41,0.4)' }} />
                  </li>
                </ul>
              </div>
            </div>

            <div className="footer-col">
              <h4>Find Us</h4>
              <ul>
                <li><strong>Address</strong>Elamkulam, Kochi, Kerala, India</li>
                <li><strong>Phone</strong>+91 85904 11348</li>
                <li>
                  <a href="https://www.google.com/maps/search/Elamkulam+Kochi+Kerala" target="_blank" rel="noopener noreferrer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Open in Google Maps 
                  </a>
                </li>
                <li>
                  <a href="/" onClick={e => { e.preventDefault(); navigate("/"); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Planet Perumbavoor 
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom">
            <p>© 2025 Planet Corner — Elamkulam, Kochi. Part of Planet Multi Cuisine Restaurant.</p>
            <button className="back-home-btn" onClick={() => navigate("/")}>← Planet Perumbavoor</button>
          </div>
        </footer>

        {/* TOAST */}
        {toast && <div className="c-toast"><span>{toast.icon}</span> {toast.msg}</div>}
      </div>
    </>
  );
}