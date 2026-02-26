import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from '@/components/Layout';
import HomePage from '@/components/HomePage';
import SigninPage from '@/components/SigninPage';
import SignupPage from '@/components/SignupPage';
import ListingDetailsPage from '@/components/ListingDetailsPage';
import ProfilePage from '@/components/ProfilePage';
import BookmarksPage from '@/components/BookmarksPage';
import CreateListingPage from '@/components/CreateListingPage';
import CheckoutPage from '@/components/CheckoutPage';
import OrdersPage from '@/components/OrdersPage';
import OrderDetailsPage from '@/components/OrderDetailsPage';
import PaymentSuccessPage from '@/components/PaymentSuccessPage';
import PaymentCancelPage from '@/components/PaymentCancelPage';
import ChatPage from '@/components/ChatPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const LogoutHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  useEffect(() => {
    logout().then(() => navigate('/login')).catch(() => navigate('/login'));
  }, [navigate, logout]);
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Signing out...</p>
      </div>
    </div>
  );
};

const W = ({ children }) => <Layout>{children}</Layout>;
const P = ({ children }) => <ProtectedRoute><W>{children}</W></ProtectedRoute>;

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<W><HomePage /></W>} />
      <Route path="/login" element={<SigninPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/logout" element={<LogoutHandler />} />
      <Route path="/listings/:id" element={<W><ListingDetailsPage /></W>} />
      <Route path="/payment-success" element={<W><PaymentSuccessPage /></W>} />
      <Route path="/payment-cancel" element={<W><PaymentCancelPage /></W>} />

      {/* Protected */}
      <Route path="/profile" element={<P><ProfilePage /></P>} />
      <Route path="/bookmarks" element={<P><BookmarksPage /></P>} />
      <Route path="/listings/new" element={<P><CreateListingPage /></P>} />
      <Route path="/orders" element={<P><OrdersPage /></P>} />
      <Route path="/orders/:id" element={<P><OrderDetailsPage /></P>} />
      <Route path="/checkout/:id" element={<P><CheckoutPage /></P>} />
      <Route path="/chat" element={<P><ChatPage /></P>} />
      <Route path="/chat/:conversationId" element={<P><ChatPage /></P>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnHover
          toastClassName="!bg-card !text-foreground !shadow-elevated !border !border-border !rounded-lg"
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
