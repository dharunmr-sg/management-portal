import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UsersList from './pages/UsersList';
import UserDetail from './pages/UserDetail';
import Organizations from './pages/Organizations';
import OrganizationDetail from './pages/OrganizationDetail';
import Settings from './pages/Settings';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Carts from './pages/Carts';
import CartDetails from './pages/CartDetails';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import NotFound from './pages/NotFound';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PageContainer from './components/layout/PageContainer';
import { SidebarProvider } from './context/SidebarContext';
import { ProductProvider } from './context/ProductContext';
import { HeaderProvider } from './context/HeaderContext';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <PageContainer>
            <Routes>
              {/* Authenticated Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/carts" element={<Carts />} />
                <Route path="/carts/:id" element={<CartDetails />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
                <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/organizations/:id" element={<OrganizationDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/*" element={<Navigate to="/settings" replace />} />
                <Route path="/users" element={<UsersList />} />
                <Route path="/users/:id" element={<UserDetail />} />
              </Route>

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
      <ProductProvider>
        <HeaderProvider>
          <AppContent />
        </HeaderProvider>
      </ProductProvider>
    </SidebarProvider>
  );
}