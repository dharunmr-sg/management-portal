import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/UsersList';
import UserDetail from './pages/UserDetail';
import Organizations from './pages/Organizations';
import OrganizationDetail from './pages/OrganizationDetail';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PageContainer from './components/layout/PageContainer';
import { SidebarProvider } from './context/SidebarContext';

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <PageContainer>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/organizations/:id" element={<OrganizationDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/*" element={<Navigate to="/settings" replace />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/users/:id" element={<UserDetail />} />

              {/* Catch-all route for 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageContainer>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SidebarProvider>
      <AppContent />
    </SidebarProvider>
  );
}