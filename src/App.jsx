import { useEffect, useRef } from 'react';
import { projects } from './content.js';
import { initSite } from './motion/setup.js';
import { Header, Footer } from './components/ui.jsx';
import { Hero, About, Layers, TechStack, Projects, Experience, Achievements, Contact } from './components/Sections.jsx';

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cleanup = initSite({ canvas: canvasRef.current, projects });
    return cleanup;
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="backdrop" aria-hidden="true">
        <span className="backdrop-name">RISHIKA RAJ</span>
      </div>
      <canvas ref={canvasRef} className="webgl" aria-hidden="true" />
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Layers />
        <TechStack />
        <Projects />
        <Experience />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
