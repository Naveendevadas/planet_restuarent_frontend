import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PAYLOAD_API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const PLANET_CORNER_RESTAURANT_ID = "6a0c309cc802dc1b90cf0bbb";

function menuImageUrl(image, apiBase) {
  if (!image?.url && !image?.filename) return null;
  if (image.url && !image.url.includes("undefined.s3.")) {
    return image.url.startsWith("http") ? image.url : `${apiBase}${image.url}`;
  }
  if (!image.filename) return null;
  const path = image.prefix ? `${image.prefix}/${image.filename}` : image.filename;
  return `${apiBase}/api/media/file/${path.split("/").map(encodeURIComponent).join("/")}`;
}

const categoryLabels = {
  "ice-cream": "Ice Creams",
  "pastries":  "Pastries & Cakes",
  "shakes":    "Milkshakes",
  "desserts":  "Desserts",
  "waffles":   "Waffles & Pancakes",
  "coffee":    "Coffee & Hot Drinks",
  "snacks":    "Snacks & Bites",
};

const categoryIcons = {
  "ice-cream": "🍦",
  "pastries":  "🧁",
  "shakes":    "🥤",
  "desserts":  "🍮",
  "waffles":   "🥞",
  "coffee":    "☕",
  "snacks":    "🍿",
};

const FALLBACK_IMAGES = {
  "ice-cream": "https://picsum.photos/seed/icecream/400/400",
  "pastries":  "https://picsum.photos/seed/pastries/400/400",
  "shakes":    "https://picsum.photos/seed/milkshake/400/400",
  "desserts":  "https://picsum.photos/seed/desserts/400/400",
  "waffles":   "https://picsum.photos/seed/waffles/400/400",
  "coffee":    "https://picsum.photos/seed/coffee/400/400",
  "snacks":    "https://picsum.photos/seed/snacks/400/400",
  "default":   "https://picsum.photos/seed/food/400/400",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');
  *,::before,::after { margin:0; padding:0; box-sizing:border-box }
  body { background:#0f2118 }

  .mp-site { background:#0f2118; color:#fff; font-family:'DM Sans',sans-serif; min-height:100vh; }

  /* ── NAV ── */
  .mp-nav {
    position:fixed; top:0; left:0; right:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding:1.2rem 4rem;
    background:rgba(15,33,24,0.95); backdrop-filter:blur(14px);
    border-bottom:1px solid rgba(240,180,41,0.15);
  }
  .mp-nav .logo-wrap { display:flex; align-items:center; gap:12px }
  .mp-nav .logo-icon {
    width:42px; height:42px; background:#f0b429; border-radius:6px;
    display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:700; color:#0f2118;
    line-height:1.2; text-align:center; letter-spacing:-0.5px;
  }
  .mp-nav .logo-text { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:700; color:#f0b429; letter-spacing:2px; display:block; }
  .mp-nav .logo-sub { font-size:0.6rem; color:rgba(240,180,41,0.7); letter-spacing:3px; text-transform:uppercase; display:block; margin-top:-2px; }
  .mp-back-btn {
    background:transparent; border:1px solid rgba(240,180,41,0.4);
    color:#f0b429; padding:0.55rem 1.3rem; border-radius:50px;
    font-family:'DM Sans',sans-serif; font-size:0.85rem;
    cursor:pointer; transition:all 0.25s; display:flex; align-items:center; gap:6px;
  }
  .mp-back-btn:hover { background:rgba(240,180,41,0.1); transform:translateX(-3px) }

  /* ── HERO ── */
  .mp-hero {
    padding:9rem 4rem 3rem; text-align:center;
    background:linear-gradient(180deg,#0d1f15 0%,#0f2118 100%);
    border-bottom:1px solid rgba(240,180,41,0.1);
  }
  .mp-hero-label { font-size:0.72rem; letter-spacing:3px; text-transform:uppercase; color:#f0b429; margin-bottom:0.8rem; }
  .mp-hero h1 { font-family:'Playfair Display',serif; font-size:3.2rem; font-weight:900; line-height:1.1; margin-bottom:0.8rem; }
  .mp-hero h1 em { font-style:normal; background:linear-gradient(135deg,#f0b429,#fce08a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .mp-hero p { color:rgba(255,255,255,0.5); font-size:0.95rem; max-width:480px; margin:0 auto; line-height:1.7; }
  .mp-gold-divider { width:50px; height:3px; background:linear-gradient(90deg,#f0b429,#fce08a); border-radius:2px; margin:1.5rem auto; }

  /* ── STICKY FILTER BAR ── */
  .mp-filter-bar {
    position:sticky; top:72px; z-index:50;
    background:rgba(15,33,24,0.97); backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(240,180,41,0.1);
    padding:0.8rem 4rem;
    overflow-x:auto; scrollbar-width:none;
  }
  .mp-filter-bar::-webkit-scrollbar { display:none }
  .mp-filter-inner { display:flex; align-items:center; gap:0; width:max-content; }
  .mp-filter-btn {
    background:transparent; border:none; border-bottom:2px solid transparent;
    color:rgba(255,255,255,0.45); padding:0.55rem 1.1rem;
    font-family:'DM Sans',sans-serif; font-size:0.82rem;
    cursor:pointer; transition:all 0.2s;
    display:flex; align-items:center; gap:5px; white-space:nowrap;
  }
  .mp-filter-btn:hover { color:rgba(255,255,255,0.8); }
  .mp-filter-btn.active { color:#f0b429; border-bottom-color:#f0b429; font-weight:600; }

  /* ── LAYOUT ── */
  .mp-layout { display:flex; max-width:1200px; margin:0 auto; }

  /* ── SIDEBAR (desktop) ── */
  .mp-sidebar {
    width:210px; flex-shrink:0; padding:2rem 0;
    position:sticky; top:132px; height:fit-content;
    display:none;
  }
  @media(min-width:900px){ .mp-sidebar { display:flex; flex-direction:column; gap:2px; } }
  .mp-scat {
    padding:0.55rem 1.2rem; border-radius:8px; font-size:0.82rem;
    color:rgba(255,255,255,0.4); cursor:pointer; transition:all 0.2s;
    border-left:2px solid transparent; display:flex; align-items:center; gap:8px;
  }
  .mp-scat:hover { color:#fff; background:rgba(255,255,255,0.04); }
  .mp-scat.active { color:#f0b429; background:rgba(240,180,41,0.07); border-left-color:#f0b429; font-weight:600; }

  /* ── CONTENT ── */
  .mp-content { flex:1; padding:2rem 2rem 6rem; min-width:0; }
  @media(max-width:900px){ .mp-content { padding:1.5rem 1.2rem 5rem; } }

  /* ── SUMMARY BAR ── */
  .mp-summary {
    display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;
    background:rgba(240,180,41,0.06); border:1px solid rgba(240,180,41,0.15);
    border-radius:16px; padding:0.9rem 1.4rem; margin-bottom:2rem;
  }
  .mp-summary-item { font-size:0.82rem; color:rgba(255,255,255,0.55); }
  .mp-summary-item strong { color:#f0b429; font-weight:700; }

  /* ── SELECTED BANNER ── */
  .mp-sel-banner {
    display:flex; align-items:center; justify-content:space-between;
    background:rgba(240,180,41,0.08); border:1px solid rgba(240,180,41,0.2);
    border-radius:14px; padding:0.8rem 1.1rem; margin-bottom:1.2rem;
    animation:fadeIn 0.25s ease;
  }
  @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .mp-sel-left { display:flex; align-items:center; gap:10px; }
  .mp-sel-emoji { font-size:1.3rem; }
  .mp-sel-title { font-size:0.92rem; font-weight:600; color:#f0b429; }
  .mp-sel-count { font-size:0.72rem; color:rgba(255,255,255,0.35); margin-top:1px; }
  .mp-sel-clear {
    background:transparent; border:1px solid rgba(240,180,41,0.3);
    color:rgba(240,180,41,0.7); padding:4px 12px; border-radius:50px;
    font-size:0.72rem; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s;
  }
  .mp-sel-clear:hover { background:rgba(240,180,41,0.1); color:#f0b429; }

  /* ── DIVIDER ── */
  .mp-divider {
    display:flex; align-items:center; gap:10px;
    margin:2rem 0 1.2rem;
  }
  .mp-div-line { flex:1; height:1px; background:rgba(240,180,41,0.12); }
  .mp-div-text { font-size:0.68rem; letter-spacing:2.5px; text-transform:uppercase; color:rgba(240,180,41,0.4); white-space:nowrap; }

  /* ── CATEGORY BLOCK ── */
  .mp-category { margin-bottom:2.5rem; }
  .mp-category-header {
    display:flex; align-items:center; gap:12px;
    margin-bottom:0.8rem; padding-bottom:0.6rem;
    border-bottom:1px solid rgba(240,180,41,0.12);
  }
  .mp-category-icon { font-size:1.3rem; }
  .mp-category-name { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; color:#f0b429; }
  .mp-category-count { font-size:0.72rem; color:rgba(255,255,255,0.3); letter-spacing:1px; margin-left:auto; }

  /* ── COLLAPSED "show more" block ── */
  .mp-show-more {
    padding:0.5rem 0 0.2rem; text-align:center;
  }
  .mp-show-more-btn {
    background:transparent; border:1px solid rgba(240,180,41,0.2);
    color:rgba(240,180,41,0.6); padding:5px 16px; border-radius:50px;
    font-size:0.75rem; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s;
  }
  .mp-show-more-btn:hover { background:rgba(240,180,41,0.08); color:#f0b429; border-color:rgba(240,180,41,0.4); }

  /* ── ITEM ROW ── */
  .mp-item {
    display:flex; align-items:center; gap:1.1rem;
    padding:0.75rem 0.5rem;
    border-bottom:1px solid rgba(255,255,255,0.04);
    border-radius:8px; transition:background 0.2s;
  }
  .mp-item:hover { background:rgba(240,180,41,0.04); }
  .mp-item:last-child { border-bottom:none; }
  .mp-item-img { width:52px; height:52px; border-radius:50%; object-fit:cover; border:2px solid rgba(240,180,41,0.2); flex-shrink:0; }
  .mp-item-info { flex:1; min-width:0; }
  .mp-item-top { display:flex; align-items:center; gap:7px; margin-bottom:2px; }
  .mp-veg-dot { width:13px; height:13px; border-radius:3px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .mp-veg-dot.veg { border:1.5px solid #4ade80; }
  .mp-veg-dot.veg::after { content:''; width:6px; height:6px; background:#4ade80; border-radius:50%; display:block; }
  .mp-veg-dot.nonveg { border:1.5px solid #f87171; }
  .mp-veg-dot.nonveg::after { content:''; width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-bottom:6px solid #f87171; display:block; }
  .mp-item-name { font-family:'Playfair Display',serif; font-size:0.98rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .mp-item-desc { font-size:0.75rem; color:rgba(255,255,255,0.38); line-height:1.4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .mp-item-right { display:flex; align-items:center; gap:0.7rem; flex-shrink:0; }
  .mp-item-price { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:#f0b429; }
  .mp-popular-pill { background:rgba(240,180,41,0.15); border:1px solid rgba(240,180,41,0.35); color:#f0b429; font-size:0.58rem; font-weight:700; padding:2px 7px; border-radius:50px; letter-spacing:0.5px; text-transform:uppercase; white-space:nowrap; }

  /* ── LOADING / ERROR / EMPTY ── */
  .mp-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:6rem 0; gap:1rem; }
  .mp-spinner { width:44px; height:44px; border:3px solid rgba(240,180,41,0.15); border-top-color:#f0b429; border-radius:50%; animation:mp-spin 0.8s linear infinite; }
  @keyframes mp-spin { to { transform:rotate(360deg) } }
  .mp-loading p { color:rgba(255,255,255,0.4); font-size:0.9rem; letter-spacing:1px; }
  .mp-error { text-align:center; padding:5rem 0; color:rgba(255,100,100,0.7); font-size:0.9rem; }
  .mp-error button { margin-top:1rem; background:transparent; border:1px solid rgba(240,180,41,0.4); color:#f0b429; padding:0.5rem 1.4rem; border-radius:50px; cursor:pointer; font-size:0.85rem; font-family:'DM Sans',sans-serif; }
  .mp-empty { text-align:center; padding:5rem 0; color:rgba(255,255,255,0.3); }

  /* ── FOOTER ── */
  .mp-footer { background:#0b1c13; border-top:1px solid rgba(240,180,41,0.1); padding:2rem 4rem; text-align:center; }
  .mp-footer p { font-size:0.78rem; color:rgba(255,255,255,0.25); }
  .mp-footer-btn { margin-top:1rem; background:transparent; border:1px solid rgba(240,180,41,0.3); color:#f0b429; padding:0.5rem 1.4rem; border-radius:50px; font-size:0.85rem; cursor:pointer; transition:all 0.25s; font-family:'DM Sans',sans-serif; }
  .mp-footer-btn:hover { background:rgba(240,180,41,0.1); transform:translateY(-2px); }

  @media(max-width:900px){
    .mp-nav { padding:1rem 1.5rem; }
    .mp-hero { padding:7rem 1.5rem 3rem; }
    .mp-hero h1 { font-size:2.2rem; }
    .mp-filter-bar { padding:0.6rem 1rem; top:64px; }
    .mp-footer { padding:2rem 1.5rem; }
  }
`;

// ─── HOOK ─────────────────────────────────────────────────────────────────────
function useMenuItems() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchMenu = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(
     `${PAYLOAD_API}/api/menu?where[restaurants][in]=${PLANET_CORNER_RESTAURANT_ID}&depth=1&limit=200`,
{ headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setItems((data.docs || []).map(doc => {
        const uploaded = menuImageUrl(doc.image, PAYLOAD_API);
        const fallback = FALLBACK_IMAGES[doc.category] || FALLBACK_IMAGES["default"];
        return {
          id: doc.id, name: doc.name, description: doc.description || "",
          price: `₹${doc.price}`, veg: doc.veg, isPopular: doc.isPopular,
          category: doc.category,
          cuisine: categoryLabels[doc.category] || doc.category,
          img: uploaded || fallback,
          fallbackImg: fallback,
        };
      }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMenu(); }, []);
  return { items, loading, error, refetch: fetchMenu };
}

// ─── ITEM ROW COMPONENT ───────────────────────────────────────────────────────
function ItemRow({ item }) {
  return (
    <div className="mp-item">
      <img
        className="mp-item-img"
        src={item.img}
        alt={item.name}
        loading="lazy"
        onError={e => { e.target.src = item.fallbackImg; }}
      />
      <div className="mp-item-info">
        <div className="mp-item-top">
          <span className={`mp-veg-dot ${item.veg ? "veg" : "nonveg"}`} title={item.veg ? "Veg" : "Non-Veg"} />
          <div className="mp-item-name">{item.name}</div>
        </div>
        {item.description && <div className="mp-item-desc">{item.description}</div>}
      </div>
      <div className="mp-item-right">
        {item.isPopular && <span className="mp-popular-pill">⭐ Popular</span>}
        <span className="mp-item-price">{item.price}</span>
      </div>
    </div>
  );
}

// ─── CATEGORY BLOCK ───────────────────────────────────────────────────────────
// collapsed=true → show only 3 items + "X more" button that jumps to that category
function CategoryBlock({ cat, items, collapsed = false, onExpand }) {
  const label   = categoryLabels[cat] || cat;
  const icon    = categoryIcons[cat]  || "🍴";
  const visible = collapsed ? items.slice(0, 3) : items;
  const extra   = collapsed ? items.length - 3 : 0;

  return (
    <div className="mp-category" id={`cat-${cat}`}>
      <div className="mp-category-header">
        <span className="mp-category-icon">{icon}</span>
        <span className="mp-category-name">{label}</span>
        <span className="mp-category-count">{items.length} items</span>
      </div>
      <div>
        {visible.map(item => <ItemRow key={item.id} item={item} />)}
      </div>
      {extra > 0 && (
        <div className="mp-show-more">
          <button className="mp-show-more-btn" onClick={() => onExpand(cat)}>
            +{extra} more in {label} →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function MenuPage() {
  const navigate = useNavigate();
  const { items, loading, error, refetch } = useMenuItems();
  const [activeCat, setActiveCat]   = useState("all");
  const filterBarRef                = useRef(null);
  const contentTopRef               = useRef(null);

  // Group by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryOrder = ["ice-cream","pastries","shakes","desserts","waffles","coffee","snacks"];
  const allCats = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  // ── SELECT CATEGORY ──
  const selectCat = (cat) => {
    setActiveCat(cat);
    // Scroll filter tab into view
    const tab = filterBarRef.current?.querySelector(`[data-cat="${cat}"]`);
    tab?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    // Scroll content to top
    setTimeout(() => {
      contentTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // ── COUNTS ──
  const vegCount     = items.filter(i => i.veg).length;
  const nonVegCount  = items.filter(i => !i.veg).length;
  const popularCount = items.filter(i => i.isPopular).length;

  // ── RENDER CATEGORIES ──
  // If a specific cat is selected: show it FULLY first, then divider, then rest collapsed
  const renderCategories = () => {
    if (activeCat === "all") {
      return allCats.map(cat => (
        <CategoryBlock key={cat} cat={cat} items={grouped[cat]} collapsed={false} onExpand={selectCat} />
      ));
    }

    const selectedItems = grouped[activeCat] || [];
    const otherCats     = allCats.filter(c => c !== activeCat);

    return (
      <>
        {/* ── SELECTED CATEGORY — fully expanded ── */}
        <CategoryBlock cat={activeCat} items={selectedItems} collapsed={false} onExpand={selectCat} />

        {/* ── DIVIDER ── */}
        {otherCats.length > 0 && (
          <div className="mp-divider">
            <div className="mp-div-line" />
            <div className="mp-div-text">Other Categories</div>
            <div className="mp-div-line" />
          </div>
        )}

        {/* ── OTHER CATEGORIES — collapsed to 3 items each ── */}
        {otherCats.map(cat => (
          <CategoryBlock key={cat} cat={cat} items={grouped[cat]} collapsed={true} onExpand={selectCat} />
        ))}
      </>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="mp-site">

        {/* NAV */}
        <nav className="mp-nav">
          <div className="logo-wrap">
            <div className="logo-icon">PLANET<br/>CORNER</div>
            <div>
              <span className="logo-text">PLANET</span>
              <span className="logo-sub">Corner — Kochi</span>
            </div>
          </div>
          <button className="mp-back-btn" onClick={() => navigate("/corner")}>
            ← Back to Planet Corner
          </button>
        </nav>

        {/* HERO */}
        <div className="mp-hero">
          <p className="mp-hero-label">Planet Corner, Kochi</p>
          <h1>Our Full <em>Menu</em></h1>
          <div className="mp-gold-divider" />
          <p>Explore our wide selection of signature dishes, refreshing beverages, desserts, café favorites, and authentic multi-cuisine specials — freshly prepared every day..</p>
        </div>

        {/* STICKY FILTER BAR */}
        {!loading && !error && items.length > 0 && (
          <div className="mp-filter-bar" ref={filterBarRef}>
            <div className="mp-filter-inner">
              {/* All tab */}
              <button
                className={`mp-filter-btn ${activeCat === "all" ? "active" : ""}`}
                data-cat="all"
                onClick={() => selectCat("all")}
              >
                🍽️ All
              </button>
              {/* Category tabs */}
              {allCats.map(cat => (
                <button
                  key={cat}
                  className={`mp-filter-btn ${activeCat === cat ? "active" : ""}`}
                  data-cat={cat}
                  onClick={() => selectCat(cat)}
                >
                  {categoryIcons[cat] || "🍴"} {categoryLabels[cat] || cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LAYOUT */}
        <div className="mp-layout">

          {/* SIDEBAR (desktop only) */}
          {!loading && !error && items.length > 0 && (
            <div className="mp-sidebar">
              <div
                className={`mp-scat ${activeCat === "all" ? "active" : ""}`}
                onClick={() => selectCat("all")}
              >
                🍽️ All Items
              </div>
              {allCats.map(cat => (
                <div
                  key={cat}
                  className={`mp-scat ${activeCat === cat ? "active" : ""}`}
                  onClick={() => selectCat(cat)}
                >
                  {categoryIcons[cat] || "🍴"} {categoryLabels[cat] || cat}
                </div>
              ))}
            </div>
          )}

          {/* CONTENT */}
          <div className="mp-content">
            <div ref={contentTopRef} />

            {/* Loading */}
            {loading && (
              <div className="mp-loading">
                <div className="mp-spinner" />
                <p>Loading menu...</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="mp-error">
                <p>⚠ Could not load menu — {error}</p>
                <button onClick={refetch}>Try Again</button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && items.length === 0 && (
              <div className="mp-empty">No menu items found.</div>
            )}

            {/* Summary bar */}
            {!loading && !error && items.length > 0 && (
              <div className="mp-summary">
                <div className="mp-summary-item"><strong>{items.length}</strong> Total Items</div>
                <div className="mp-summary-item"><strong>{allCats.length}</strong> Categories</div>
                <div className="mp-summary-item">🟢 <strong>{vegCount}</strong> Veg</div>
                <div className="mp-summary-item">🔴 <strong>{nonVegCount}</strong> Non-Veg</div>
                {popularCount > 0 && <div className="mp-summary-item">⭐ <strong>{popularCount}</strong> Popular</div>}
              </div>
            )}

            {/* Selected category banner */}
            {!loading && !error && activeCat !== "all" && (
              <div className="mp-sel-banner">
                <div className="mp-sel-left">
                  <span className="mp-sel-emoji">{categoryIcons[activeCat] || "🍴"}</span>
                  <div>
                    <div className="mp-sel-title">{categoryLabels[activeCat] || activeCat}</div>
                    <div className="mp-sel-count">{(grouped[activeCat] || []).length} items</div>
                  </div>
                </div>
                <button className="mp-sel-clear" onClick={() => selectCat("all")}>✕ Show All</button>
              </div>
            )}

            {/* Categories */}
            {!loading && !error && items.length > 0 && renderCategories()}

          </div>
        </div>

        {/* FOOTER */}
        <div className="mp-footer">
          <p>© 2025 Planet Corner — Elamkulam, Kochi</p>
          <button className="mp-footer-btn" onClick={() => navigate("/corner")}>
            ← Back to Planet Corner
          </button>
        </div>

      </div>
    </>
  );
}