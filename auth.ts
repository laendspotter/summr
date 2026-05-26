@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

:root {
  --sun: #FF6B35;
  --sun-light: #FF9A6C;
  --sun-dim: rgba(255,107,53,0.15);
  --sky: #0EA5E9;
  --grass: #22C55E;

  /* dark mode base */
  --bg: #0D0D0F;
  --bg-card: #161618;
  --bg-hover: #1E1E21;
  --border: #2A2A2E;
  --border-light: #222226;
  --text: #F0F0F2;
  --text-muted: #6B6B75;
  --text-sub: #9B9BA5;
  --white: #FFFFFF;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, .logo, button, .badge {
  font-family: 'Syne', sans-serif;
}

/* BUTTONS */
.btn-primary {
  background: var(--sun);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 11px 22px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.18s;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  white-space: nowrap;
}
.btn-primary:hover {
  background: #e85e28;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255,107,53,0.3);
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-secondary {
  background: var(--bg-card);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 20px;
  font-family: 'Syne', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.18s;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
}
.btn-secondary:hover { border-color: var(--sun); color: var(--sun); background: var(--bg-hover); }

.btn-ghost {
  background: none;
  border: none;
  color: var(--text-muted);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 8px;
  transition: all 0.15s;
}
.btn-ghost:hover { color: var(--text); background: var(--bg-hover); }

/* CARD */
.card {
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid var(--border);
  overflow: hidden;
  transition: all 0.2s;
}
.card:hover { border-color: #3A3A3E; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
.card-link { text-decoration: none; display: block; }

/* INPUT */
.input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 11px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  background: var(--bg-hover);
  color: var(--text);
  outline: none;
  transition: border-color 0.15s;
}
.input:focus { border-color: var(--sun); }
.input::placeholder { color: var(--text-muted); }
.input option { background: var(--bg-card); }

/* BADGE */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Syne', sans-serif;
  letter-spacing: 0.3px;
}
.badge-sun { background: rgba(255,107,53,0.15); color: var(--sun); }
.badge-sky { background: rgba(14,165,233,0.15); color: #38BDF8; }
.badge-grass { background: rgba(34,197,94,0.15); color: #4ADE80; }
.badge-muted { background: var(--bg-hover); color: var(--text-muted); border: 1px solid var(--border); }

/* NAV */
nav {
  background: rgba(13,13,15,0.85);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.nav-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.logo {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: var(--sun);
  text-decoration: none;
  letter-spacing: -0.5px;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
}
.nav-link {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}
.nav-link:hover { color: var(--text); background: var(--bg-hover); }
.nav-link.active { color: var(--text); }

/* PAGE */
.page-wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* CHAT */
.chat-bubble {
  max-width: 78%;
  padding: 9px 13px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  font-family: 'DM Sans', sans-serif;
}
.chat-bubble.me {
  background: var(--sun);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 3px;
}
.chat-bubble.other {
  background: var(--bg-hover);
  color: var(--text);
  align-self: flex-start;
  border-bottom-left-radius: 3px;
  border: 1px solid var(--border);
}

/* ANIMATIONS */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.45s ease forwards; opacity: 0; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.loading-shimmer {
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 16px;
}

/* DIVIDER */
.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 0;
}

/* SCROLLBAR */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #3A3A3E; }

/* RANGE INPUT */
input[type=range] { accent-color: var(--sun); }

/* TOAST */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  z-index: 999;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  animation: fadeUp 0.3s ease forwards;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 320px;
}
.toast.success { border-left: 3px solid var(--grass); }
.toast.error { border-left: 3px solid #EF4444; }
