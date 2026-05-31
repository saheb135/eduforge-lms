import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import CoursePage from './pages/CoursePage';
import AdminPanel from './pages/AdminPanel';
import LoadingSpinner from './components/ui/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'STUDENT' ? '/dashboard' : '/admin'} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) {
    return <Navigate to={user.role === 'STUDENT' ? '/dashboard' : '/admin'} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>}
      />
      <Route
        path="/course/:id"
        element={<ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}><CoursePage /></ProtectedRoute>}
      />
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><AdminPanel /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
