import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const modalStyles = `
  @keyframes bmFadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes bmSlideUp { from{opacity:0;transform:translateY(40px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes bmPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
  @keyframes bmShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }

  .bm-overlay{position:fixed;inset:0;z-index:9999;background:rgba(8,18,12,0.93);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:bmFadeIn 0.4s ease both}
  .bm-box{background:linear-gradient(180deg,#1e2e22 0%,#131f17 100%);border:1px solid rgba(240,180,41,0.2);border-radius:28px;padding:2.8rem 2.5rem 2.2rem;max-width:660px;width:100%;text-align:center;animation:bmSlideUp 0.5s 0.1s ease both;position:relative;overflow:hidden}
  .bm-box::before{content:'';position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:420px;height:420px;background:radial-gradient(circle,rgba(240,180,41,0.07) 0%,transparent 70%);pointer-events:none}
  .bm-close{position:absolute;top:1rem;right:1rem;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.25s;font-size:1rem;z-index:10}
  .bm-close:hover{background:rgba(255,255,255,0.12);color:#fff;border-color:rgba(255,255,255,0.3);transform:scale(1.1)}
  .bm-logo{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:1.6rem}
  .bm-logo img{height:38px;width:auto;object-fit:contain}
  .bm-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(240,180,41,0.1);border:1px solid rgba(240,180,41,0.3);padding:0.38rem 1.1rem;border-radius:50px;font-size:0.68rem;letter-spacing:3px;text-transform:uppercase;color:#f5c842;margin-bottom:1.1rem}
  .bm-dot{width:6px;height:6px;background:#f0b429;border-radius:50%;box-shadow:0 0 10px #f0b429;animation:bmPulse 1.8s infinite}
  .bm-title{font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:900;color:#fff;line-height:1.15;margin-bottom:0.4rem}
  .bm-title em{font-style:normal;background:linear-gradient(135deg,#f0b429,#fce08a,#f0b429);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:bmShimmer 4s linear infinite}
  .bm-sub{font-size:0.88rem;color:rgba(255,255,255,0.45);margin-bottom:0.5rem;line-height:1.6}
  .bm-divider{width:48px;height:2px;background:linear-gradient(90deg,transparent,#f0b429,transparent);margin:1.4rem auto 1.8rem}
  .bm-cards{display:grid;grid-template-columns:1fr 1fr;gap:1.1rem;margin-bottom:1.4rem}
  .bm-card{background:linear-gradient(180deg,#243328 0%,#1a2820 100%);border:1px solid rgba(240,180,41,0.15);border-radius:20px;padding:1.6rem 1.3rem 1.4rem;cursor:pointer;transition:all 0.4s cubic-bezier(0.22,1,0.36,1);text-align:left;position:relative;overflow:hidden}
  .bm-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(240,180,41,0.07),transparent);opacity:0;transition:opacity 0.3s}
  .bm-card:hover::before{opacity:1}
  .bm-card:hover{border-color:rgba(240,180,41,0.5);transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,0.4),0 0 0 1px rgba(240,180,41,0.18)}
  .bm-card:active{transform:translateY(-2px) scale(0.99)}
  .bm-card-tag{display:inline-block;font-size:0.6rem;letter-spacing:2px;text-transform:uppercase;background:rgba(240,180,41,0.12);border:1px solid rgba(240,180,41,0.3);color:#f0b429;padding:2px 9px;border-radius:50px;margin-bottom:0.9rem}
  .bm-card-img{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid rgba(240,180,41,0.2);margin-bottom:0.9rem;display:block}
  .bm-card-name{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:0.2rem}
  .bm-card-sub{font-size:0.72rem;color:rgba(255,255,255,0.38);letter-spacing:0.5px;margin-bottom:0.9rem}
  .bm-card-info{display:flex;flex-direction:column;gap:0.38rem;margin-bottom:1.1rem}
  .bm-card-row{display:flex;align-items:center;gap:7px;font-size:0.76rem;color:rgba(255,255,255,0.52)}
  .bm-card-row svg{flex-shrink:0;color:rgba(240,180,41,0.55)}
  .bm-card-btn{display:flex;align-items:center;justify-content:space-between;background:rgba(240,180,41,0.08);border:1px solid rgba(240,180,41,0.25);border-radius:50px;padding:0.52rem 1rem;color:#f0b429;font-size:0.78rem;font-weight:600;font-family:'DM Sans',sans-serif;transition:all 0.25s;width:100%}
  .bm-card:hover .bm-card-btn{background:#f0b429;color:#0f2118;border-color:#f0b429}
  .bm-card-btn svg{transition:transform 0.25s}
  .bm-card:hover .bm-card-btn svg{transform:translateX(3px)}
  .bm-footer{font-size:0.7rem;color:rgba(255,255,255,0.22);letter-spacing:0.5px}

  @media(max-width:520px){
    .bm-box{padding:2rem 1.1rem 1.7rem;border-radius:20px}
    .bm-title{font-size:1.4rem}
    .bm-cards{grid-template-columns:1fr;gap:0.9rem}
    .bm-card{padding:1.2rem 1.1rem}
  }
`;

export default function BranchModal() {
  const [show, setShow] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const seen = sessionStorage.getItem("planet_branch_selected");
    if (!seen && location.pathname === "/") {
      // 2 second delay before showing modal
      const id = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(id);
    }
  }, []);

  const choose = (path) => {
    sessionStorage.setItem("planet_branch_selected", "1");
    setShow(false);
    navigate(path);
  };

  const close = () => {
    sessionStorage.setItem("planet_branch_selected", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      <style>{modalStyles}</style>
      <div className="bm-overlay" onClick={close}>
        <div className="bm-box" onClick={e => e.stopPropagation()}>

          {/* Close button */}
          <button className="bm-close" onClick={close} aria-label="Close">✕</button>

          <div className="bm-logo">
            <img src="/images/planet-logo-transparent.png" alt="Planet" />
          </div>

          <div className="bm-badge">
            <span className="bm-dot" />
            Welcome to Planet
          </div>

          <h2 className="bm-title">Choose Your <em>Branch</em></h2>
          <p className="bm-sub">We have two locations — pick the one closest to you.</p>

          <div className="bm-divider" />

          <div className="bm-cards">

            {/* Planet Main */}
            <div className="bm-card" onClick={() => choose("/")}>
              <span className="bm-card-tag">Main Branch</span>
              <img
                className="bm-card-img"
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=120&q=80"
                alt="Planet"
              />
              <p className="bm-card-name">Planet</p>
              <p className="bm-card-sub">Multi Cuisine Restaurant</p>
              <div className="bm-card-info">
                <div className="bm-card-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Perumbavoor, Kerala
                </div>
                <div className="bm-card-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  11:00 AM – 11:00 PM
                </div>
                <div className="bm-card-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  +91 98765 43210
                </div>
              </div>
              <div className="bm-card-btn">
                Visit Branch
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>

            {/* Planet Corner */}
            <div className="bm-card" onClick={() => choose("/corner")}>
              <span className="bm-card-tag">Second Branch</span>
              <img
                className="bm-card-img"
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=120&q=80"
                alt="Planet Corner"
              />
              <p className="bm-card-name">Planet Corner</p>
              <p className="bm-card-sub">Kochi Outlet</p>
              <div className="bm-card-info">
                <div className="bm-card-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Elamkulam, Kochi
                </div>
                <div className="bm-card-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  11:00 AM – 11:00 PM
                </div>
                <div className="bm-card-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  +91 85904 11348
                </div>
              </div>
              <div className="bm-card-btn">
                Visit Branch
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>

          </div>

          <p className="bm-footer">You can switch branches anytime from the navigation</p>

        </div>
      </div>
    </>
  );
}