import { profile } from '../content.js';

export const Arrow = ({ dir = 'ne' }) => (
  <svg className={`ico ico--${dir}`} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    {dir === 'ne' ? (
      <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

export const Chips = ({ items, className = '' }) => (
  <ul className={`chips ${className}`} role="list">
    {items.map((t) => (
      <li key={t} className="chip">
        {t}
      </li>
    ))}
  </ul>
);

export const LayerDots = ({ on = [] }) => (
  <span className="layer-dots" aria-hidden="true">
    {['ui', 'api', 'db'].map((k) => (
      <i key={k} className={`layer-dot layer-dot--${k} ${on.includes(k) ? 'is-on' : ''}`} />
    ))}
  </span>
);

export function Header() {
  const links = [
    ['#about', 'About'],
    ['#stack', 'Stack'],
    ['#projects', 'Projects'],
    ['#experience', 'Experience'],
    ['#contact', 'Contact'],
  ];
  return (
    <header className="site-header">
      <a className="brand" href="#hero" aria-label={`${profile.name}, back to top`}>
        <span className="brand__mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="brand__name">{profile.name}</span>
        <span className="brand__ver">v2.0</span>
      </a>
      <nav className="site-nav" aria-label="Primary">
        <ul role="list">
          {links.map(([href, label]) => (
            <li key={href} className={`nav-${label.toLowerCase()}`}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <p>© 2026 {profile.name} · {profile.role}</p>
        <p className="muted">Built with React, Three.js, GSAP and Lenis.</p>
        <a href="#hero" className="link">
          Back to top <Arrow dir="ne" />
        </a>
      </div>
    </footer>
  );
}
