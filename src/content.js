/**
 * ─────────────────────────────────────────────────────────────
 *  ALL SITE CONTENT LIVES HERE.
 *  Standardized with high-impact, professional engineering copy.
 * ─────────────────────────────────────────────────────────────
 */

export const profile = {
  name: 'Rishika Raj',
  role: 'Full Stack Software Engineer',
  email: 'rr4175653@gmail.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/rishikaraj724',
    github: 'https://github.com/RishikA0605',
    leetcode: 'https://leetcode.com/u/Rishika_9661/',
  },
};

export const hero = {
  headline: 'Rishika Raj',
  version: 'v2.0',
  subtitle:
    'Full Stack Software Engineer. Architecting intuitive client interfaces, high-throughput APIs, and scalable relational data models.',
  cta: "Let's connect",
  hint: 'Scroll to explore system layers',
};

export const about = {
  headline: 'v1.0 mastered the client. v2.0 architects the entire stack.',
  text: "Engineered and shipped production-grade web applications for North American clients as a Software Development Intern. Currently building full-stack enterprise features at Help Infinite, mastering distributed system architectures, low-latency networking, and scalable database design.",
};

/** Labels shown while the 3D stack is exploded (top → bottom slab). */
export const layers = [
  { key: 'ui', slab: 'UI', title: 'Frontend Architecture', items: ['React.js', 'Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'Shadcn UI'] },
  { key: 'api', slab: 'API', title: 'Backend & Services', items: ['Node.js', 'RESTful APIs', 'NextAuth / OAuth 2.0', 'Socket.io (WebSockets)'] },
  { key: 'db', slab: 'DB', title: 'Data Persistence & Cache', items: ['PostgreSQL', 'MongoDB', 'Prisma ORM', 'Redis (Upstash)'] },
];

export const techStack = [
  { group: 'Core Languages', items: ['C++', 'JavaScript (ESNext)', 'TypeScript'] },
  {
    group: 'Frontend & UI Engineering',
    items: ['React.js', 'Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'Shadcn UI', 'React Hook Form', 'Zod', 'Vite', 'HTML5 & Modern CSS3', 'Design Systems (Figma)'],
  },
  {
    group: 'Backend & Microservices',
    items: ['Node.js', 'RESTful API Architecture', 'NextAuth / OAuth 2.0 (Google, GitHub)', 'RBAC (Role-Based Access)', 'Socket.io (WebSockets)'],
  },
  { group: 'Database & Caching Systems', items: ['PostgreSQL', 'MongoDB', 'Prisma ORM', 'Redis (Upstash Cache)'] },
  { group: 'DevOps & Cloud Infrastructure', items: ['Git & GitHub CI/CD', 'Postman', 'Cloudinary CDN', 'Vercel', 'Railway'] },
  { group: 'Active Engineering Focus', items: ['Distributed Systems Architecture', 'Networking & Protocols (TCP/IP, HTTP/3)'], learning: true },
];

/**
 * Projects.
 *  - links.live / links.github : replace "#" with real URLs.
 *  - layers   : which 3D stack slabs light up while the card is active.
 *  - screen   : built-in code-drawn laptop preview ('devsync' | 'adventra' | 'restaurant').
 *  - screenImage : optional path to a real screenshot in /public (e.g. '/screens/devsync.webp').
 *                  When set, it replaces the code-drawn preview on the laptop screen.
 *  - screenImageMobile : optional path to a mobile screenshot in /public (e.g. '/screens/devsync-mobile.webp').
 *                        When set, it replaces the code-drawn preview on the companion 3D smartphone.
 */
export const projects = [
  {
    id: 'devsync',
    title: 'DevSync AI',
    tag: 'Full Stack System',
    layers: ['ui', 'api', 'db'],
    description:
      'Enterprise team collaboration platform featuring bi-directional real-time communication via WebSockets, multi-tenant RBAC permissions, AI copilot workflows, and asynchronous task management with relational integrity.',
    tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Socket.io', 'Redis', 'NextAuth', 'Cloudinary', 'Tailwind CSS'],
    links: { live: '#', github: '#' },
    screen: 'devsync',
    screenImage: null,
    screenImageMobile: null,
  },
  {
    id: 'adventra',
    title: 'Adventra',
    tag: 'Frontend Platform',
    layers: ['ui'],
    description:
      'High-conversion travel discovery and booking platform featuring dynamic expedition filtering, multi-stage checkout state machine, and performant responsive layouts with sub-second page transitions.',
    tech: ['React', 'TypeScript', 'Tailwind CSS'],
    links: { live: '#', github: '#' },
    screen: 'adventra',
    screenImage: null,
    screenImageMobile: null,
  },
  {
    id: 'restaurant',
    title: 'Artisan Kitchen',
    tag: 'Design System & UI',
    layers: ['ui'],
    description:
      'Modern culinary ordering platform designed with an atomic component architecture, featuring interactive menu state management, promotional showcase drawers, and fluid mobile-first responsiveness.',
    tech: ['React', 'Vite', 'JavaScript (ES6+)', 'Modern CSS3'],
    links: { live: '#', github: '#' },
    screen: 'restaurant',
    screenImage: null,
    screenImageMobile: null,
  },
];

export const experience = [
  {
    version: 'v2.0',
    role: 'Full Stack Software Engineer',
    org: 'Help Infinite',
    period: 'Sep 2026 – Present',
    current: true,
    notes: [
      'Architecting and shipping end-to-end client applications, owning delivery across responsive React frontends, robust Node.js APIs, and optimized PostgreSQL/Prisma schemas.',
      'Translating complex business requirements into high-availability RESTful and real-time endpoints with sub-100ms response targets and strict schema validation.',
      'Collaborating in Agile engineering sprints, enforcing code quality through peer PR reviews, CI/CD pipelines, and integrating distributed caching strategies with Redis.',
    ],
  },
  {
    version: 'v1.0',
    role: 'Software Engineering Intern',
    org: 'Suvrin Technologies',
    period: 'Apr 2026 – Sep 2026',
    notes: [
      'Delivered 3+ production-ready web applications for North American enterprise clients utilizing Next.js (App Router), TypeScript, and Tailwind CSS.',
      'Constructed pixel-perfect, accessible UI components from Figma design tokens, ensuring cross-browser compatibility and achieving >95 Lighthouse performance scores.',
      'Engineered strictly typed client-side state architectures with React Hook Form, Zod schema validation, and reusable Shadcn UI design patterns.',
    ],
  },
  {
    version: 'v0.1',
    role: 'B.Tech in Computer Science & Engineering',
    org: 'Bihar Engineering University',
    period: '2021 – 2025',
    notes: [
      'Core Foundations: Data Structures & Algorithms, Object-Oriented Design (C++), Database Management Systems (DBMS), Operating Systems, and Computer Networks.',
    ],
  },
];

export const achievements = {
  leetcode: {
    title: 'LeetCode Algorithmic Record',
    text: 'Solved 423 problems (103 Easy, 262 Medium, 58 Hard) with 15 competitive badges, including the coveted 365-Day Consistency Streak, demonstrating disciplined algorithmic reasoning and problem decomposition.',
    stats: [
      { value: 423, label: 'Problems Solved' },
      { value: 58, label: 'Hard Algorithms' },
      { value: 15, label: 'Earned Badges' },
    ],
    cta: 'Inspect LeetCode Profile',
  },
  items: [
    { title: '3+ Enterprise Deployments', context: 'Suvrin Technologies', text: 'Engineered and shipped production-grade Next.js web applications for US-based enterprise clients.' },
    { title: 'Distributed Real-Time Architecture', context: 'DevSync AI', text: 'Architected end-to-end WebSocket communication, multi-tenant RBAC security, and resilient database schemas.' },
    { title: 'Distributed Systems Specialization', context: 'Engineering Focus', text: 'Actively mastering high-throughput system design, distributed caching hierarchies, and core network protocols.' },
  ],
};

export const contact = {
  headline: "Let's engineer something great.",
  text: 'Available for full stack engineering roles, high-impact technical initiatives, and architectural consultations. Initiate conversation below.',
};
