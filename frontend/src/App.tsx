import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';
import StoresList from './pages/user/StoresList';
import OwnerDashboard from './pages/owner/OwnerDashboard';

function RoleLanding() {
  const { user, loading } = useAuth();
  if (loading) return <div className="centered">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'owner') return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <Layout>
              <ChangePassword />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <AdminUsers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <AdminStores />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/stores"
        element={
          <ProtectedRoute roles={['user']}>
            <Layout>
              <StoresList />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner"
        element={
          <ProtectedRoute roles={['owner']}>
            <Layout>
              <OwnerDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<RoleLanding />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
