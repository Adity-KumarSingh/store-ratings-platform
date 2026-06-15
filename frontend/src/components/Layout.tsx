import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navByRole: Record<string, { to: string; label: string }[]> = {
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/stores', label: 'Stores' },
  ],
  user: [{ to: '/stores', label: 'Stores' }],
  owner: [{ to: '/owner', label: 'My Store' }],
};

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = user ? navByRole[user.role] ?? [] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">★ Store Ratings</div>
        <nav className="nav">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={location.pathname === l.to ? 'nav-link active' : 'nav-link'}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/change-password"
              className={location.pathname === '/change-password' ? 'nav-link active' : 'nav-link'}
            >
              Change Password
            </Link>
          )}
        </nav>
        {user && (
          <div className="user-area">
            <span className="user-badge">
              {user.name.split(' ')[0]} · {user.role}
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
