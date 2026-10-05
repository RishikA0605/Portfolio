/**
 * ─────────────────────────────────────────────────────────────
 *  ALL SITE CONTENT LIVES HERE.
 *  Edit text, links and project previews in this one file.
 * ─────────────────────────────────────────────────────────────
 */

export const profile = {
  name: 'Rishika Raj',
  role: 'Full Stack Developer',
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
    'Full Stack Developer. I build the interface, the API behind it, and the database under both.',
  cta: "Let's talk",
  hint: 'Scroll to take it apart',
};

export const about = {
  headline: 'v1.0 built the front. v2.0 owns the whole stack.',
  text: "I started as a web developer intern shipping Next.js apps for US clients. Today I'm a full stack developer at Help Infinite, and I'm learning system design and networking to build things that scale.",
};

/** Labels shown while the 3D stack is exploded (top → bottom slab). */
export const layers = [
  { key: 'ui', slab: 'UI', title: 'Frontend', items: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Shadcn UI'] },
  { key: 'api', slab: 'API', title: 'Backend', items: ['Node.js', 'REST APIs', 'NextAuth', 'Socket.io'] },
  { key: 'db', slab: 'DB', title: 'Database', items: ['PostgreSQL', 'MongoDB', 'Prisma', 'Redis'] },
];

export const techStack = [
  { group: 'Languages', items: ['C++', 'JavaScript', 'TypeScript'] },
  {
    group: 'Frontend',
    items: ['React.js', 'Next.js', 'Tailwind CSS', 'Shadcn UI', 'React Hook Form', 'Zod', 'Vite', 'HTML', 'CSS', 'Figma to code'],
  },
  {
    group: 'Backend',
    items: ['Node.js', 'REST APIs', 'NextAuth', 'Google and GitHub OAuth', 'Role-based access', 'Socket.io'],
  },
  { group: 'Database', items: ['PostgreSQL', 'MongoDB', 'Prisma ORM', 'Redis (Upstash)'] },
  { group: 'Tools and deployment', items: ['Git', 'GitHub', 'Postman', 'Cloudinary', 'Vercel', 'Railway'] },
  { group: 'Learning now', items: ['System design', 'Networking concepts'], learning: true },
];

/**
 * Projects.
 *  - links.live / links.github : replace "#" with real URLs.
 *  - layers   : which 3D stack slabs light up while the card is active.
 *  - screen   : built-in code-drawn laptop preview ('devsync' | 'adventra' | 'restaurant').
 *  - screenImage : optional path to a real screenshot in /public (e.g. '/screens/devsync.webp').
 *                  When set, it replaces the code-drawn preview on the laptop screen.
 */
export const projects = [
  {
    id: 'devsync',
    title: 'DevSync AI',
    tag: 'Full stack',
    layers: ['ui', 'api', 'db'],
    description:
      'AI-powered team collaboration platform with Google and GitHub sign-in, workspaces with role-based access, real-time chat, Kanban tasks, notifications and file uploads.',
    tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Socket.io', 'Redis', 'NextAuth', 'Cloudinary', 'Tailwind CSS'],
    links: { live: '#', github: '#' },
    screen: 'devsync',
    screenImage: null,
  },
  {
    id: 'adventra',
    title: 'Adventra',
    tag: 'Frontend',
    layers: ['ui'],
    description:
      'Travel and tourism website where you explore destinations and book a package through a full flow: package selection, traveler details and confirmation.',
    tech: ['React', 'TypeScript', 'Tailwind CSS'],
    links: { live: '#', github: '#' },
    screen: 'adventra',
    screenImage: null,
  },
  {
    id: 'restaurant',
    title: 'Responsive Food Restaurant UI',
    tag: 'Frontend',
    layers: ['ui'],
    description:
      'Restaurant website showing menu sections, food items and offers, built from reusable components that work on desktop and mobile.',
    tech: ['React', 'Vite', 'JavaScript', 'CSS'],
    links: { live: '#', github: '#' },
    screen: 'restaurant',
    screenImage: null,
  },
];

export const experience = [
  {
    version: 'v2.0',
    role: 'Full Stack Developer',
    org: 'Help Infinite',
    period: 'Sep 2026 to now',
    current: true,
    notes: [
      'Building features for client projects across the frontend, backend and database.',
      'Turning client requirements into working features, from UI to API to data model.',
      'Working with the team on Git and GitHub, and learning system design and networking to build for scale.',
    ],
  },
  {
    version: 'v1.0',
    role: 'Web Developer Intern',
    org: 'Suvrin Technologies',
    period: 'Apr 2026 to Sep 2026',
    notes: [
      'Delivered 3+ production-ready web apps for US-based clients with Next.js, React, TypeScript and Tailwind CSS.',
      'Built responsive, pixel-perfect interfaces from Figma designs, tested across browsers and devices.',
      'Made reusable components with the App Router and Shadcn UI, and added form validation with React Hook Form and Zod.',
    ],
  },
  {
    version: 'Education',
    role: 'B.Tech in Computer Science and Engineering',
    org: 'Bihar Engineering University',
    period: '2021 to 2025',
    notes: [],
  },
];

export const achievements = {
  leetcode: {
    title: 'LeetCode',
    text: 'Solved 423 problems (103 easy, 262 medium, 58 hard) and earned 15 badges, including the 365 Days Badge.',
    stats: [
      { value: 423, label: 'Problems solved' },
      { value: 58, label: 'Hard problems' },
      { value: 15, label: 'Badges' },
    ],
    cta: 'View profile',
  },
  items: [
    { title: '3+ client apps shipped', context: 'Suvrin Technologies', text: 'Production-ready web apps for US-based clients.' },
    { title: 'Real-time full stack build', context: 'DevSync AI', text: 'OAuth sign-in, role-based access, live chat and Kanban tasks.' },
    { title: 'Moving to system design', context: 'Learning', text: 'Studying system design and networking to build products that scale.' },
  ],
};

export const contact = {
  headline: "Let's build something.",
  text: 'Got a project, a role, or a system design question? Say hello.',
};
