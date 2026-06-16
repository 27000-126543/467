import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CityDetail from '@/pages/CityDetail';
import InstitutionDetail from '@/pages/InstitutionDetail';
import Alerts from '@/pages/Alerts';
import AlertDetail from '@/pages/AlertDetail';
import Approvals from '@/pages/Approvals';
import ApprovalDetail from '@/pages/ApprovalDetail';
import Enrollment from '@/pages/Enrollment';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/city/:cityName"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CityDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/institution/:institutionId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <InstitutionDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Alerts />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AlertDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Approvals />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ApprovalDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Enrollment />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRole="national">
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
