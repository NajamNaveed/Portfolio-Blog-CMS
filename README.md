# Portfolio + Blog CMS

A full-stack Portfolio and Blog Content Management System built with the MERN stack.

The project combines a public-facing developer portfolio and blog with a secure admin CMS that allows authenticated administrators to create, edit, publish, unpublish, and delete blog posts.

The application is fully deployed with the frontend hosted on Vercel, the backend hosted on Render, and MongoDB Atlas used for database storage.

---

## Live Demo

**Live Website:**  
https://portfolio-blog-cms.vercel.app/

**Backend API:**  
https://portfolio-blog-cms.onrender.com/

---

## Features

### Public Portfolio

- Responsive developer portfolio
- Home section with introduction and call-to-action
- About section
- Skills and technologies
- Projects section with GitHub repository links
- Public blog listing
- Individual blog post pages
- Responsive navigation
- Smooth animations and transitions
- Mobile-friendly layout

### Blog

- Public blog listing
- Individual blog post pages
- Published posts are publicly accessible
- Draft posts remain hidden from the public
- Markdown-based post content
- Post metadata such as title, date, tags, and cover image

### Admin CMS

- Secure admin authentication
- JWT-based authentication
- Protected admin routes
- Admin dashboard
- Create blog posts
- Edit blog posts
- Delete blog posts
- Save posts as drafts
- Publish posts
- Unpublish posts
- Post status management
- Admin logout
- Responsive admin interface

### Security

- Password hashing with bcrypt
- JWT authentication
- Protected admin endpoints
- Role-based admin authorization
- Login rate limiting
- CORS configuration
- Helmet security headers
- Environment-based secrets
- Server-side author assignment
- Public API only exposes published posts

---

## Tech Stack

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
- JSON Web Tokens (JWT)
- bcryptjs
- express-rate-limit
- Helmet
- CORS

### Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

---

## Architecture

The application follows a client-server architecture:

```text
                    ┌─────────────────────┐
                    │      User / Admin    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │      (Vercel)       │
                    └──────────┬──────────┘
                               │
                         HTTP / REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │       (Render)      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   MongoDB / Mongoose │
                    │    (MongoDB Atlas)   │
                    └─────────────────────┘

Project Structure
portfolio-blog-cms/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── README.md
└── BUILD_LOG.md
Local Development
Prerequisites

Make sure you have installed:

Node.js
npm
MongoDB Atlas account or a local MongoDB instance
Git
1. Clone the Repository
git clone https://github.com/NajamNaveed/portfolio-blog-cms.git
cd portfolio-blog-cms
2. Setup the Backend
cd server
npm install

Create a .env file based on .env.example.

Example:

NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173

ADMIN_NAME=your_admin_name
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

Start the development server:

npm run dev

The backend will run on:

http://localhost:5000
3. Setup the Frontend

Open another terminal:

cd client
npm install

Create a .env file:

VITE_API_URL=http://localhost:5000/api

Start the frontend:

npm run dev

The frontend will normally be available at:

http://localhost:5173
Authentication

The admin area is protected using JWT authentication.

Admin users authenticate through:

/admin/login

After successful authentication, the administrator can access the CMS dashboard.

Authentication is handled through the backend API, while protected frontend routes prevent unauthenticated users from accessing admin pages.

JWT secrets and administrator credentials are stored through environment variables and are not committed to the repository.

Blog Workflow

The CMS supports a complete draft-to-publish workflow.

Create Post
     │
     ▼
   Draft
     │
     │ Publish
     ▼
 Published
     │
     │ Unpublish
     ▼
   Draft
Draft

A draft post can be created and edited from the admin dashboard but is not displayed on the public blog.

Publish

Publishing a post changes its status to published, making it available through the public blog.

Unpublish

An administrator can unpublish a post, returning it to draft status and removing it from the public blog.

Production Deployment

The application is deployed using:

Frontend

Vercel

https://portfolio-blog-cms.vercel.app/
Backend

Render

https://portfolio-blog-cms.onrender.com/
Database

MongoDB Atlas

The production backend connects to MongoDB Atlas through the MONGO_URI environment variable.

Production Environment Variables
Backend

The backend requires:

NODE_ENV=production
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_URL=
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
Frontend

The frontend requires:

VITE_API_URL=

For the deployed application, the API URL points to the production backend:

https://portfolio-blog-cms.onrender.com/api

Never commit real environment variables, database credentials, JWT secrets, or administrator passwords to GitHub.

API Overview

The backend exposes REST API endpoints for:

Authentication
Blog posts
Admin post management
Health checking

The frontend communicates with the backend through Axios using the configured VITE_API_URL.

Testing

Before deployment, the application was tested through:

Production frontend build
Backend syntax validation
Local frontend/backend testing
MongoDB Atlas connection testing
Authentication testing
Admin route protection
Post creation
Post editing
Post deletion
Draft/publish workflow
Public blog visibility
Production deployment

Frontend production build:

npm run build
Security Considerations

The application includes several security measures:

Passwords are hashed using bcrypt
JWT authentication protects admin operations
Admin authorization is enforced on protected API routes
Login attempts are rate limited
Helmet provides security-related HTTP headers
CORS restricts frontend origins
Sensitive configuration is stored in environment variables
Draft posts are excluded from public responses
Author information is derived server-side
Markdown rendering does not use unsafe raw HTML rendering
Future Improvements

Potential future improvements include:

Image upload/storage service
Rich text or enhanced Markdown editor
Search and filtering
Post categories
Pagination improvements
Analytics dashboard
Comments system
Automated testing
CI/CD pipeline
Error monitoring
Custom domain
Author
Najam Naveed

Full Stack Developer focused on building modern web applications using JavaScript, React, Node.js, Express, PHP, and databases.

GitHub:
https://github.com/NajamNaveed