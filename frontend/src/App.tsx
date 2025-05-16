import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import RequestForm from '@/pages/RequestForm';
import UserRequests from '@/pages/UserRequests';
import FoodbankRequests from '@/pages/FoodbankRequests';
import InventoryManagement from '@/pages/InventoryManagement';
import OrgDashboard from '@/pages/OrgDashboard';
import TrackRequest from '@/pages/TrackRequest';
import AllRequests from '@/pages/AllRequests';
import Foodbanks from '@/pages/Foodbanks';

// Route guard component for protected routes
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
      
      {/* Public routes */}
      <Route path="/request" element={<RequestForm />} />
      <Route path="/track" element={<TrackRequest />} />
      
      {/* User Routes */}
      <Route path="/my-requests" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserRequests />
        </ProtectedRoute>
      } />
      
      {/* Foodbank Routes */}
      <Route path="/foodbank-requests" element={
        <ProtectedRoute allowedRoles={['foodbank']}>
          <FoodbankRequests />
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={['foodbank']}>
          <InventoryManagement />
        </ProtectedRoute>
      } />
      
      {/* Organization Routes */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute allowedRoles={['org']}>
          <OrgDashboard />
        </ProtectedRoute>
      } />
      <Route path="/foodbanks" element={
        <ProtectedRoute allowedRoles={['org']}>
          <Foodbanks />
        </ProtectedRoute>
      } />
      <Route path="/all-requests" element={
        <ProtectedRoute allowedRoles={['org']}>
          <AllRequests />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AuthProvider>
  );
}

export default App;