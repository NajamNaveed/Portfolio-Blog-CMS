# Build Log — Portfolio + Blog CMS

## 1. Project Overview

Portfolio + Blog CMS is a full-stack MERN application that combines a personal developer portfolio with a content management system for publishing blog posts.

The project was built as a real, production-deployed application with:

- Public portfolio pages
- Public blog and individual post pages
- Admin authentication
- Protected admin dashboard
- Create, edit, and delete post functionality
- Draft/published workflow
- Responsive UI
- GitHub links for featured projects
- Markdown-based blog content
- Production security and deployment configuration

---

## 2. Technology Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- Axios
- React Markdown

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs
- express-rate-limit
- Helmet

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 3. Development Process

### Phase 1 — Project Foundation

The application was structured as separate frontend and backend applications.

The frontend was built with React and Vite, while the backend was implemented using Express and MongoDB.

Environment variables were used to keep configuration such as API URLs, database credentials, JWT secrets, and deployment-specific settings outside the application code.

---

### Phase 2 — Authentication & CMS

Admin authentication was implemented using JWT-based authentication.

The admin area contains protected routes and provides a CMS workflow for managing blog posts.

Implemented functionality includes:

- Admin login and logout
- Protected admin routes
- Create posts
- Edit posts
- Delete posts
- Draft posts
- Publish/unpublish posts
- Public access only to published posts
- Server-side author handling

Passwords are hashed using bcryptjs rather than being stored as plain text.

---

### Phase 3 — Public Portfolio & Blog

The public-facing portion of the application was developed as a responsive personal portfolio.

Main sections include:

- Home
- About
- Projects
- Blog

The Projects section contains links to my GitHub repositories:

- Mart Management System
- TraceVision
- Real-Time Chat App

The blog supports individual post pages and Markdown content.

Markdown rendering was kept intentionally restricted to avoid unsafe raw HTML rendering.

---

### Phase 4 — UI & UX Improvements

The interface was refined with a focus on maintaining a clean and professional developer-portfolio style.

Improvements included:

- Responsive layouts
- Consistent spacing and typography
- Navigation improvements
- Hover and focus states
- Subtle transitions and animations
- Responsive mobile navigation
- Improved cards and content presentation
- Accessibility-focused keyboard states
- Reduced-motion support

The admin interface was kept intentionally functional and simple rather than introducing unnecessary visual complexity.

---

### Phase 5 — Security & Production Readiness

Before deployment, the application was reviewed for common production issues.

The backend was improved with:

- Helmet security headers
- Reverse-proxy support using Express `trust proxy`
- Login rate limiting
- MongoDB connection timeouts
- Improved startup error handling
- Environment-based configuration
- Production error handling

The application was also reviewed for:

- Hardcoded secrets
- Unsafe Markdown rendering
- Unauthorized admin access
- Public access to draft posts
- Incorrect author assignment
- Authentication handling
- CORS configuration

No application secrets were intentionally committed to the repository.

---

### Phase 6 — Testing

The application was tested locally before deployment.

Frontend production builds were successfully generated using:

```bash
npm run build

Backend syntax/configuration checks were also performed.

The main application workflows were manually tested, including:

Public pages
Blog pages
Admin login
Admin dashboard
Creating posts
Editing posts
Publishing/unpublishing posts
Deleting posts
Frontend/backend API communication
Phase 7 — Deployment

The backend was deployed to Render and the frontend was deployed to Vercel.

The production frontend was configured to communicate with the deployed backend through:

VITE_API_URL

The production backend was configured with environment variables for:

MongoDB connection
JWT configuration
CORS origin
Admin credentials
Production environment

After deployment, the production application was tested to confirm that the frontend could communicate successfully with the backend.

4. AI Usage Notes

AI tools were used throughout the development process as development assistants and code-review tools.

Tools Used
Claude
GitHub Copilot
OpenAI Codex / ChatGPT
How AI Assisted

AI was used for:

Reviewing project architecture
Suggesting implementation approaches
Debugging frontend and backend issues
Reviewing authentication and API flows
Identifying production-readiness concerns
Reviewing security considerations
Suggesting UI/UX improvements
Improving responsive behavior and accessibility
Assisting with documentation
Reviewing deployment configuration

AI was also used to help identify potential issues such as reverse-proxy handling, security headers, authentication edge cases, and production environment configuration.

My Role

I remained responsible for the project decisions, implementation, testing, and deployment.

AI-generated suggestions were reviewed before being applied, and changes were tested through local builds, application testing, and production verification.

The final application reflects my own implementation decisions and understanding of the technologies used.

5. Production Verification

The final frontend production build completed successfully:

vite build
✓ 283 modules transformed
✓ built successfully

The backend was also successfully deployed and connected to the production MongoDB database.

The deployed application was manually tested after deployment to verify the main public and administrative workflows.

6. Current Deployment
Frontend

https://portfolio-blog-cms.vercel.app/

Backend

https://portfolio-blog-cms.onrender.com/

Source Code

The complete source code is available in the accompanying GitHub repository.

7. Final Outcome

The project meets the core definition of done:

Working deployed portfolio
Working public blog
Admin authentication
Protected CMS
Create/edit/delete workflow
Draft/publish workflow
Production frontend and backend
Database integration
Security configuration
Project documentation
AI usage disclosure