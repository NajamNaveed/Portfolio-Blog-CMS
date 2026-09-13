require('dotenv').config();
const mongoose = require('mongoose');
const SiteContent = require('../models/SiteContent');
const Project = require('../models/Project');
const User = require('../models/User');
const { generateUniqueSlug } = require('./slugify');

const DEFAULT_SKILLS = [
  { label: 'Frontend', items: [
    { name: 'HTML', icon: 'SiHtml5' },
    { name: 'CSS', icon: 'SiCss3' },
    { name: 'JavaScript', icon: 'SiJavascript' },
    { name: 'React.js', icon: 'SiReact' },
    { name: 'Tailwind CSS', icon: 'SiTailwindcss' },
    { name: 'Bootstrap', icon: 'SiBootstrap' },
  ]},
  { label: 'Backend', items: [
    { name: 'Node.js', icon: 'SiNodedotjs' },
    { name: 'Express.js', icon: 'SiExpress' },
    { name: 'PHP', icon: 'SiPhp' },
    { name: 'MySQL', icon: 'SiMysql' },
    { name: 'MongoDB', icon: 'SiMongodb' },
  ]},
  { label: 'Tools & Languages', items: [
    { name: 'Git', icon: 'SiGit' },
    { name: 'GitHub', icon: 'SiGithub' },
    { name: 'Python', icon: 'SiPython' },
    { name: 'C++', icon: 'SiCplusplus' },
  ]},
];

const DEFAULT_FOCUS_AREAS = [
  { title: 'Full Stack Web Applications', description: 'Building complete applications end-to-end, from database design through to a polished, responsive interface.', icon: 'Layers' },
  { title: 'Modern Responsive Interfaces', description: 'Building interfaces with React and Tailwind CSS that adapt cleanly across screen sizes.', icon: 'MonitorSmartphone' },
  { title: 'Backend APIs & Databases', description: 'Designing REST APIs with Node.js and Express, backed by MongoDB and MySQL.', icon: 'Database' },
];

const DEFAULT_PROJECTS = [
  {
    title: 'Mart Management System',
    description: 'Full-stack retail management system with inventory, POS, sales, purchases, and analytics.',
    longDescription: 'A complete retail management platform covering inventory tracking, point-of-sale, purchasing, and sales analytics for small-to-medium retail businesses.',
    technologies: ['React', 'PHP', 'MySQL'],
    githubUrl: 'https://github.com/NajamNaveed/Mart-Management-System',
    featured: true,
    order: 1,
  },
  {
    title: 'TraceVision',
    description: 'Network path analyzer with live world map visualization, topology graph, and hop statistics.',
    longDescription: 'Visualizes network traceroute data on a live world map with a topology graph and per-hop latency statistics.',
    technologies: ['React', 'Node.js', 'Leaflet'],
    githubUrl: 'https://github.com/NajamNaveed/TraceVision',
    featured: true,
    order: 2,
  },
  {
    title: 'Real-Time Chat App',
    description: 'Real-time messaging application enabling instant communication between multiple connected users.',
    longDescription: 'A Socket.IO powered chat application supporting instant, bidirectional messaging between multiple concurrent users.',
    technologies: ['Node.js', 'Socket.IO', 'JavaScript'],
    githubUrl: 'https://github.com/NajamNaveed/RealTime-Chat-App',
    featured: false,
    order: 3,
  },
];

async function seedContent() {
  const { MONGO_URI } = process.env;
  if (!MONGO_URI) {
    console.error('Missing required environment variable: MONGO_URI');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found. Run "npm run seed" first to create one.');
      process.exitCode = 1;
      return;
    }

    const existingContent = await SiteContent.findOne();
    if (existingContent) {
      console.log('SiteContent already exists. Skipping site content seed.');
    } else {
      await SiteContent.create({
        brand: { name: 'Najam Naveed', role: 'Full Stack Developer' },
        hero: {
          eyebrow: 'Full Stack Developer',
          headline: 'Najam Naveed',
          roles: ['Full Stack Developer', 'React & Node Engineer', 'API Architect'],
          description:
            'I design and build modern, responsive web applications end-to-end using JavaScript, React, Node.js, Express, PHP, and MongoDB — for founders and teams who need a reliable engineering partner.',
          primaryCta: { label: 'View Projects', href: '/projects' },
          secondaryCta: { label: 'Get In Touch', href: '/contact' },
        },
        about: {
          intro:
            "I'm Najam Naveed, a Full Stack Developer focused on building modern, responsive web applications using JavaScript, React, Node.js, Express, PHP, and MongoDB.",
          approachTitle: 'Approach',
          approachText:
            "I build applications end-to-end — designing the data model, building a clear REST API, and pairing it with a responsive, accessible interface. I favor clean separation between frontend and backend, predictable state management, and code that's easy for another developer to pick up.",
          resumeUrl: '',
          yearsExperience: 3,
          projectsCompleted: 15,
        },
        focusAreas: DEFAULT_FOCUS_AREAS,
        skills: DEFAULT_SKILLS,
        socialLinks: [
          { label: 'GitHub', url: 'https://github.com/NajamNaveed', icon: 'Github' },
          { label: 'LinkedIn', url: 'http://www.linkedin.com/in/najam-naveed-96bb9437a', icon: 'Linkedin' },
        ],
        contact: {
          email: '',
          phone: '',
          location: '',
          availability: 'Open to new projects',
        },
        footer: { tagline: 'Full Stack Developer building reliable, modern web applications.' },
      });
      console.log('SiteContent seeded.');
    }

    const existingProjectCount = await Project.countDocuments();
    if (existingProjectCount > 0) {
      console.log('Projects already exist. Skipping project seed.');
    } else {
      for (const proj of DEFAULT_PROJECTS) {
        const slug = await generateUniqueSlug(proj.title, Project);
        await Project.create({
          ...proj,
          slug,
          status: 'published',
          publishedAt: new Date(),
          author: admin._id,
        });
      }
      console.log(`Seeded ${DEFAULT_PROJECTS.length} projects.`);
    }
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedContent();
}

module.exports = { seedContent };
