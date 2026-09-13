import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/public/Home';
import About from './pages/public/About';
import Projects from './pages/public/Projects';
import Blog from './pages/public/Blog';
import BlogPost from './pages/public/BlogPost';
import Contact from './pages/public/Contact';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Posts from './pages/admin/Posts';
import CreatePost from './pages/admin/CreatePost';
import EditPost from './pages/admin/EditPost';
import AdminProjects from './pages/admin/Projects';
import CreateProject from './pages/admin/CreateProject';
import EditProject from './pages/admin/EditProject';
import SiteContentEditor from './pages/admin/SiteContentEditor';
import Messages from './pages/admin/Messages';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="site-content" element={<SiteContentEditor />} />
        <Route path="posts" element={<Posts />} />
        <Route path="posts/new" element={<CreatePost />} />
        <Route path="posts/:id/edit" element={<EditPost />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/new" element={<CreateProject />} />
        <Route path="projects/:id/edit" element={<EditProject />} />
        <Route path="messages" element={<Messages />} />
      </Route>
    </Routes>
  );
}
