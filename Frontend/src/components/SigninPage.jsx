import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const SigninPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Remember me state
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    setRememberMe(e.target.checked);
  };
  
  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      
      // Show first error as toast
      const firstError = Object.values(formErrors)[0];
      toast.error(firstError);
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    // Create form data for submission
    const submitData = new URLSearchParams();
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    if (rememberMe) {
      submitData.append('rememberMe', 'true');
    }
    
    try {
      const response = await fetch('/api/v1/user/login', {
        method: 'POST',
        body: submitData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow'
      });
      
      if (response.ok || response.redirected) {
        toast.success('Login successful! Redirecting...');
        
        // If there's a redirect URL in the response, go there, otherwise go to homepage
        if (response.redirected) {
          window.location.href = response.url;
        } else {
          // Redirect to home page after successful login
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } else {
        // Handle errors based on status code
        try {
          // Try to parse response as JSON first
          const data = await response.json();
          
          if (response.status === 401) {
            // Handle invalid credentials specifically
            toast.error(data.message || 'Invalid email or password. Please check your credentials and try again.');
            
            // Mark both fields as having errors for visual feedback
            setErrors({
              email: 'Invalid credentials',
              password: 'Invalid credentials'
            });
            
            // Clear the password field for security
            setFormData({
              ...formData,
              password: ''
            });
          } else if (response.status === 404) {
            toast.error(data.message || 'User not found. Please check your email address.');
            
            // Mark email field as having an error
            setErrors({
              email: 'User not found',
              password: ''
            });
          } else {
            // Generic error handling for other status codes
            toast.error(data.message || 'Failed to login');
          }
        } catch (error) {
          // Fallback error handling if response is not valid JSON
          toast.error('Failed to login. Please try again.');
          console.error('Error parsing response:', error);
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 py-8 relative">
      <Link to="/" className="absolute top-5 left-5 text-gray-700 hover:text-primary-600 flex items-center font-medium">
        <i className="fas fa-home mr-1"></i> Back to Home
      </Link>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 sm:p-8 my-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h1>
          <p className="text-gray-600">Welcome back to Thriftify</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'}`}
            />
            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'}`}
            />
            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
           
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed h-12 flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="text-center mt-6 text-gray-600">
          <p>Don't have an account yet? <Link to="/signup" className="text-primary-600 font-medium hover:underline">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
