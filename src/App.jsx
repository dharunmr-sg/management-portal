import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/UsersList';
import UserDetail from './pages/UserDetail';
import Organizations from './pages/Organizations';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PageContainer from './components/layout/PageContainer';
import { useTheme } from './context/ThemeContext'; // 1. Import teleporter!

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 2. Grab the dark mode state!
  const { isDarkMode } = useTheme();

  return (
    // 3. Dynamically change the background color based on the state!
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {/* 3. Pass the state and a closing function to the Sidebar */}
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto">
          <PageContainer>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Note how order doesn't usually matter, but specific routes should generally go before dynamic ones */}
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/organizations" element={<Organizations />} />
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

export default App;