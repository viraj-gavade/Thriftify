
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './components/SignupPage';
import SigninPage from './components/SigninPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<SigninPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPlaceholder />} />
        {/* Add other routes here */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

// Placeholder HomePage component
const HomePage = () => {
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
