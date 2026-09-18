import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/site-content', label: 'Site Content' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/jobs', label: 'Jobs' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/analytics', label: 'Analytics' },
];

export default function AdminSidebar({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-gray-900 ${
              isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}