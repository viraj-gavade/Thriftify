import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilepic: null
  });
  
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
  
  // File input change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setFormData({
        ...formData,
        profilepic: file
      });
      
      // Clear profile picture error if it exists
      if (errors.profilepic) {
        setErrors({
          ...errors,
          profilepic: ''
        });
      }
    }
  };
  
  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    
    // Validate fullname
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9.,_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate profile picture
    if (!formData.profilepic) {
      newErrors.profilepic = 'Profile picture is required';
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
    
    // Create form data for submission (including file)
    const submitFormData = new FormData();
    submitFormData.append('fullname', formData.fullname);
    submitFormData.append('username', formData.username);
    submitFormData.append('email', formData.email);
    submitFormData.append('password', formData.password);
    submitFormData.append('confirmPassword', formData.confirmPassword);
    submitFormData.append('profilepic', formData.profilepic);
    
    try {
      const response = await fetch('/api/v1/user/signup', {
        method: 'POST',
        body: submitFormData,
        redirect: 'follow'
      });
      
      if (response.ok) {
        toast.success('Account created successfully! Redirecting...');
        
        // Redirect to login page after successful signup
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (response.redirected) {
        window.location.href = response.url;
      } else {
        // Handle errors based on status code
        if (response.status === 409 || response.status === 400) {
          const data = await response.json();
          
          if (data && data.errors && Array.isArray(data.errors)) {
            // Handle multiple validation errors
            data.errors.forEach(err => {
              toast.error(err.message || err);
            });
            
            // Update form errors
            const newErrors = {};
            data.errors.forEach(err => {
              const fieldName = getFieldFromErrorMessage(err.message || err);
              if (fieldName) {
                newErrors[fieldName] = err.message || err;
              }
            });
            
            setErrors(newErrors);
          } else if (data && data.message) {
            // Handle single error message
            toast.error(data.message);
          } else {
            // Fallback error message
            toast.error('Invalid input. Please check your information and try again.');
          }
        } else {          // Generic error handling
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            toast.error(data.message || 'Failed to create account');
          } catch {
            toast.error('Failed to create account');
          }
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to extract field name from error message
  const getFieldFromErrorMessage = (message) => {
    if (!message) return null;
    
    const fieldMap = {
      'username': 'username',
      'email': 'email',
      'password': 'password',
      'fullname': 'fullname',
      'confirmPassword': 'confirmPassword',
      'profilepic': 'profilepic'
    };
    
    for (const [key, value] of Object.entries(fieldMap)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return null;
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Create an Account</h1>
          <p className="text-gray-600">Join Thriftify and start buying & selling today</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullname" className="block font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              placeholder="Enter your full name"
              value={formData.fullname}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.fullname ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'}`}
            />
            {errors.fullname && <div className="text-red-500 text-sm mt-1">{errors.fullname}</div>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="username" className="block font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'}`}
            />
            {errors.username && <div className="text-red-500 text-sm mt-1">{errors.username}</div>}
          </div>
          
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'}`}
            />
            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirm_password" className="block font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'}`}
            />
            {errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>}
          </div>
          
          <div className="mb-5">
            <label htmlFor="profilepic" className="block font-medium text-gray-700 mb-1">Profile Picture</label>
            <input
              type="file"
              id="profilepic"
              name="profilepic"
              accept="image/*"
              onChange={handleFileChange}
              required
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${errors.profilepic ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'}`}
            />
            {errors.profilepic && <div className="text-red-500 text-sm mt-1">{errors.profilepic}</div>}
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
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="text-center mt-6 text-gray-600">
          <p>Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
