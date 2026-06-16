import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '@/store/auth';
import { useDashboardStore } from '@/store/dashboard';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuthStore();
  const { fetchNationalMetrics, fetchProvinceMetrics, fetchHeatmapData, fetchRecentAlerts } = useDashboardStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchNationalMetrics();
    fetchProvinceMetrics();
    fetchHeatmapData('attendance');
    fetchRecentAlerts();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <div className="ml-64 min-h-screen transition-all duration-300">
        <Header />
        <main className="p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
