import {
  profile,
  hero,
  about,
  layers,
  techStack,
  projects,
  experience,
  achievements,
  contact,
} from '../content.js';
import { Arrow, Chips, LayerDots } from './ui.jsx';

/** CSS-only stack shown when WebGL is unavailable. */
function HeroFallback() {
  return (
    <div className="css-stack" aria-hidden="true">
      <div className="css-stack__slab css-stack__slab--ui"><span>UI</span></div>
      <div className="css-stack__slab css-stack__slab--api"><span>API</span></div>
      <div className="css-stack__slab css-stack__slab--db"><span>DB</span></div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="section hero" aria-labelledby="hero-title">
      <div className="wrap hero__inner">
        <div className="col col--left hero__text">
          <p className="eyebrow" data-hero-reveal>
            <span className="eyebrow__dot" /> {profile.role}
          </p>
          <h1 id="hero-title" className="display" data-hero-reveal>
            {hero.headline} <span className="ver-tag">{hero.version}</span>
          </h1>
          <p className="lede" data-hero-reveal>
            {hero.subtitle}
          </p>
          <div className="hero__actions" data-hero-reveal>
            <a id="cta-talk" className="btn btn--primary" href="#contact">
              {hero.cta} <Arrow dir="e" />
            </a>
            <span className="hint">
              <span className="hint__wheel" aria-hidden="true" />
              {hero.hint}
            </span>
          </div>
        </div>
        <HeroFallback />
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="wrap">
        <div className="col col--right panel-m">
          <p className="eyebrow" data-reveal>README.md</p>
          <h2 id="about-title" className="h2" data-reveal>
            {about.headline}
          </h2>
          <p className="body-l" data-reveal>
            {about.text}
          </p>
          <pre className="diff" data-reveal aria-label="Version diff: v1.0 frontend, v2.0 frontend, API and database">
            <code>
              <span className="diff__del">- v1.0  frontend</span>
              {'\n'}
              <span className="diff__add">+ v2.0  frontend + api + database</span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

export function Layers() {
  return (
    <section id="layers" className="section layers" aria-labelledby="layers-title">
      <div className="layers__sticky">
        <div className="wrap layers__inner">
          <div className="col col--left">
            <p className="eyebrow">Full stack, taken apart</p>
            <h2 id="layers-title" className="h2 h2--sm">
              Three layers. <span className="muted">One developer.</span>
            </h2>
            <ol className="layer-labels" role="list">
              {layers.map((l) => (
                <li key={l.key} className={`layer-label layer-label--${l.key}`} data-layer-label>
                  <div className="layer-label__head">
                    <span className="layer-label__slab">{l.slab}</span>
                    <h3 className="layer-label__title">{l.title}</h3>
                  </div>
                  <Chips items={l.items} className="chips--sm" />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TechStack() {
  return (
    <section id="stack" className="section tech" aria-labelledby="stack-title">
      <div className="tech__sticky">
        <div className="wrap">
          <div className="col col--right panel-m">
            <p className="eyebrow" data-reveal>stack.json</p>
            <h2 id="stack-title" className="h2" data-reveal>
              Tech stack
            </h2>
            <dl className="tech__groups">
              {techStack.map((g) => (
                <div key={g.group} className={`tech__row ${g.learning ? 'tech__row--learning' : ''}`} data-reveal>
                  <dt>
                    {g.learning && <span className="live-dot" aria-hidden="true" />}
                    {g.group}
                  </dt>
                  <dd>
                    <Chips items={g.items} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="wrap">
        <header className="col col--right projects__head">
          <p className="eyebrow" data-reveal>projects/</p>
          <h2 id="projects-title" className="h2" data-reveal>
            Projects
          </h2>
        </header>
        {projects.map((p, i) => (
          <article key={p.id} id={`project-${p.id}`} className="project col col--right" data-project aria-labelledby={`project-${p.id}-title`}>
            <div className="project__card">
              <div className="project__meta">
                <span className="project__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="tag">
                  <LayerDots on={p.layers} />
                  {p.tag}
                </span>
              </div>
              <h3 id={`project-${p.id}-title`} className="project__title">
                {p.title}
              </h3>
              <p className="project__desc">{p.description}</p>
              <Chips items={p.tech} className="chips--sm" />
              <div className="project__links">
                <a id={`project-${p.id}-live`} className="btn btn--ghost" href={p.links.live} target="_blank" rel="noopener">
                  Live demo <Arrow />
                </a>
                <a id={`project-${p.id}-github`} className="btn btn--ghost" href={p.links.github} target="_blank" rel="noopener">
                  GitHub <Arrow />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" className="section experience" aria-labelledby="experience-title">
      <div className="wrap">
        <div className="col col--left">
          <p className="eyebrow eyebrow--teal" data-reveal>CHANGELOG.md</p>
          <h2 id="experience-title" className="h2" data-reveal>
            Release notes
          </h2>
          <ol className="timeline" role="list">
            {experience.map((r) => (
              <li key={r.version} className={`release ${r.current ? 'release--current' : ''}`} data-release>
                <span className="release__node" aria-hidden="true" />
                <div className="release__card">
                  <div className="release__top">
                    <span className="release__ver">{r.version}</span>
                    {r.current && <span className="release__latest">latest</span>}
                    <span className="release__period">{r.period}</span>
                  </div>
                  <h3 className="release__role">{r.role}</h3>
                  <p className="release__org">{r.org}</p>
                  {r.notes.length > 0 && (
                    <ul className="release__notes">
                      {r.notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Achievements() {
  const { leetcode, items } = achievements;
  return (
    <section id="achievements" className="section achievements" aria-labelledby="achievements-title">
      <div className="wrap">
        <div className="col col--right panel-m">
          <p className="eyebrow" data-reveal>achievements.log</p>
          <h2 id="achievements-title" className="h2" data-reveal>
            Achievements
          </h2>
          <div className="leet" data-reveal>
            <div className="leet__head">
              <h3 className="leet__title">{leetcode.title}</h3>
              <a id="leetcode-profile" className="btn btn--ghost" href={profile.links.leetcode} target="_blank" rel="noopener">
                {leetcode.cta} <Arrow />
              </a>
            </div>
            <dl className="stats">
              {leetcode.stats.map((s) => (
                <div key={s.label} className="stat">
                  <dt>{s.label}</dt>
                  <dd data-count={s.value}>{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="leet__text">{leetcode.text}</p>
          </div>
          <ul className="wins" role="list">
            {items.map((a) => (
              <li key={a.title} className="win" data-reveal>
                <div className="win__head">
                  <h3>{a.title}</h3>
                  <span className="win__ctx">{a.context}</span>
                </div>
                <p>{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const links = [
    ['LinkedIn', profile.links.linkedin],
    ['GitHub', profile.links.github],
    ['LeetCode', profile.links.leetcode],
  ];
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="wrap">
        <div className="col col--right panel-m">
          <p className="eyebrow" data-reveal>contact.sh</p>
          <h2 id="contact-title" className="display display--contact" data-reveal>
            {contact.headline}
          </h2>
          <p className="body-l" data-reveal>
            {contact.text}
          </p>
          <a id="contact-email" className="btn btn--primary btn--xl" href={`mailto:${profile.email}`} data-reveal>
            <span className="btn__label">Email me</span>
            <span className="btn__mail">{profile.email}</span>
            <Arrow dir="e" />
          </a>
          <ul className="socials" role="list" data-reveal>
            {links.map(([label, href]) => (
              <li key={label}>
                <a id={`contact-${label.toLowerCase()}`} className="social" href={href} target="_blank" rel="noopener">
                  {label} <Arrow />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
