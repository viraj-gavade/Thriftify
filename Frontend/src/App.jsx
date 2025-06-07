
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './components/SignupPage';
import SigninPage from './components/SigninPage';
import HomePage from './components/HomePage';
import ListingDetailsPage from './components/ListingDetailsPage';
// import { HomePage } from './components/HomePage';  // Logout handler component
import { useState, useEffect  ,useNavigate} from 'react';
const LogoutHandler = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        await axios.get('/api/v1/user/logout', { withCredentials: true });
        setIsAuthenticated(false);
        navigate('/login');
      } catch (err) {
        console.error('Error logging out:', err);
        navigate('/login');
      }
    };
    
    performLogout();
  }, [navigate, setIsAuthenticated]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-lg">Logging out...</p>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status when the app loads
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/v1/user/check-auth', {
          withCredentials: true
        });
        setIsAuthenticated(response.status === 200);
      } catch {
        // If there's an error, user is not authenticated
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<SigninPage />} />
        <Route path="/" element={<HomePage/>} />
        <Route path="/logout" element={<LogoutHandler setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/listings/:id" element={<div>Listing Details (Coming Soon)</div>} />
       
        {/* Protected routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <div>Profile Page (Coming Soon)</div>
          </ProtectedRoute>
        } />
        <Route path="/bookmarks" element={
          <ProtectedRoute>
            <div>Bookmarks Page (Coming Soon)</div>
          </ProtectedRoute>
        } />
        <Route path="/listings/new" element={
          <ProtectedRoute>
            <div>Create Listing Page (Coming Soon)</div>
          </ProtectedRoute>
        } />
        
        {/* Add other routes here */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

// Landing page component for users who aren't logged in yet
const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Thriftify</h1>
        <p className="text-lg text-gray-600 mb-8">The marketplace for buying and selling pre-loved items</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/signup" 
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-0.5"
          >
            Sign Up
          </a>
          <a 
            href="/login" 
            className="border border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-3 px-6 rounded-md transition duration-300"
          >
            Log In
          </a>
        </div>
      </div>
    </div>
  );
};

// Placeholder ForgotPassword component
const ForgotPasswordPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full text-center bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Forgot Password</h1>
        <p className="text-gray-600 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
        <div className="mb-6">
          <input 
            type="email" 
            placeholder="Enter your email address"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
          />
        </div>
        <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-md transition duration-300">
          Send Reset Link
        </button>
        <div className="mt-4">
          <a href="/login" className="text-primary-600 hover:text-primary-700">
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
};

export default App
