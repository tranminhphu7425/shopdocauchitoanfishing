import { Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from 'components/theme-provider';
import { CartProvider } from 'components/cart/cart-context';
import { Navbar } from 'components/layout/navbar';
import ContactButtons from 'components/contact-buttons';
import { WelcomeToast } from 'components/welcome-toast';

// Placeholders for Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CollectionPage from './pages/CollectionPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import EditProductPage from './pages/admin/EditProductPage';
import NewProductPage from './pages/admin/NewProductPage';
import { AdminAuthGuard } from 'components/admin/admin-auth-guard';
import Footer from 'components/layout/footer';

function Layout() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Navbar />
        <main>
          <Outlet />
          <WelcomeToast />
        </main>
        <ContactButtons />
        <Footer />
      </CartProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <div className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white min-h-screen">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/search/:collection" element={<CollectionPage />} />
          <Route path="/product/:handle" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          
          <Route
            path="/admin"
            element={
              <AdminAuthGuard>
                <AdminDashboard />
              </AdminAuthGuard>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <AdminAuthGuard>
                <NewProductPage />
              </AdminAuthGuard>
            }
          />
          <Route
            path="/admin/products/:handle/edit"
            element={
              <AdminAuthGuard>
                <EditProductPage />
              </AdminAuthGuard>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}
