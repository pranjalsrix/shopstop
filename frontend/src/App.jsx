
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderSuccess from './pages/OrderSuccess';
import About from './pages/About';
import Disclaimer from './pages/Disclaimer';
import ReturnPolicy from './pages/ReturnPolicy';
import VerifyEmail from './pages/VerifyEmail';
import MyOrders from './pages/MyOrders';

import AdminDashboard from './admin/AdminDashboard';
import AddProduct from './admin/AddProduct';
import AdminProducts from './admin/AdminProducts';
import EditProduct from './admin/EditProduct';
import AdminOrders from './admin/AdminOrders';
import AdminUsers from './admin/AdminUsers';

const RequireLogin = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const RequireAdmin = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <Navbar />

      <div className="main-content">
        <Routes>
          {/* Public storefront */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/about" element={<About />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/return" element={<ReturnPolicy />} />

          {/* Buyer account routes */}
          <Route
            path="/checkout"
            element={<RequireLogin><Checkout /></RequireLogin>}
          />
          <Route
            path="/profile"
            element={<RequireLogin><Profile /></RequireLogin>}
          />
          <Route
            path="/my-orders"
            element={<RequireLogin><MyOrders /></RequireLogin>}
          />
          <Route
            path="/ordersuccess"
            element={<RequireLogin><OrderSuccess /></RequireLogin>}
          />

          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={<RequireAdmin><AdminDashboard /></RequireAdmin>}
          />
          <Route
            path="/admin/add-product"
            element={<RequireAdmin><AddProduct /></RequireAdmin>}
          />
          <Route
            path="/admin/products"
            element={<RequireAdmin><AdminProducts /></RequireAdmin>}
          />
          <Route
            path="/admin/edit-product/:id"
            element={<RequireAdmin><EditProduct /></RequireAdmin>}
          />
          <Route
            path="/admin/orders"
            element={<RequireAdmin><AdminOrders /></RequireAdmin>}
          />
          <Route
            path="/admin/users"
            element={<RequireAdmin><AdminUsers /></RequireAdmin>}
          />

          {/* Unknown URL */}
          <Route
            path="*"
            element={
              <main style={{ padding: '3rem', textAlign: 'center' }}>
                <h1>404 — Page not found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </main>
            }
          />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;
