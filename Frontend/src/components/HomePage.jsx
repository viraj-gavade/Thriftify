import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { FaSearch, FaPlus, FaBookmark, FaRegBookmark, FaShoppingCart, 
         FaUserCircle, FaTag, FaMapMarkerAlt, FaFilter, FaTimes } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';


const HomePage = () => {
  // State variables
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [categories] = useState([
    'electronics', 'furniture', 'clothing', 'books', 'others'
  ]);
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    sortBy: 'desc' // Default: newest first
  });
  
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/v1/user/check-auth', { withCredentials: true });
        setIsAuthenticated(response.status === 200);
      } catch (error) {
        console.log(error)
        setIsAuthenticated(false);
        console.log('User not authenticated');
      }
    };
    
    checkAuth();
  }, []);

  // Fetch listings when component mounts or filters change
  useEffect(() => {
    fetchListings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Fetch user's bookmarks if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBookmarks();
    }
  }, [isAuthenticated]);

  // Fetch listings from API
  const fetchListings = async () => {
    setLoading(true);
    try {
      let queryString = `sortOrder=${filters.sortBy}`;
      if (filters.category) queryString += `&category=${encodeURIComponent(filters.category)}`;
      if (filters.location) queryString += `&location=${encodeURIComponent(filters.location)}`;
      if (searchQuery) queryString += `&query=${encodeURIComponent(searchQuery)}`;
      
      const response = await axios.get(`/api/v1/listings/sorted?${queryString}`);
      console.log('Fetched listings:', response.data);
      
      // The API returns listings in the "message" field based on console output
      const listingsData = response.data.message || [];
      setListings(Array.isArray(listingsData) ? listingsData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings. Please try again later.');
      setListings([]);
      setLoading(false);
    }
  };

  // Fetch user's bookmarks
  const fetchUserBookmarks = async () => {
    try {
      const response = await axios.get('/api/v1/user/bookmarks', { withCredentials: true });
      setUserBookmarks(response.data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setUserBookmarks([]);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings();
  };
  
  // Apply filters
  const applyFilters = () => {
    fetchListings();
  };
  
  // Handle bookmark toggle
  const handleBookmarkToggle = async (listingId) => {
    if (!isAuthenticated) {
      toast.info('Please log in to bookmark items');
      navigate('/login');
      return;
    }
    
    try {
      const response = await axios.post(`/api/v1/bookmarks/toggle/${listingId}`, {
        listingId
      }, { withCredentials: true });
      
      // Refresh bookmarks after toggle
      fetchUserBookmarks();
      
      // Show success toast
      const action = response.data.message.includes('removed') ? 'removed from' : 'added to';
      toast.success(`Item ${action} bookmarks!`);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark. Please try again.');
    }
  };

  // Header with Navigation
  const Header = () => (
    <header className="bg-[#2c3e50] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold mr-2">Thriftify</span>
              <span className="text-[#3498db]">
                <FaTag className="h-5 w-5" />
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
              Home
            </Link>
            <Link to="/categories" className="text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
              Categories
            </Link>
            <Link to="/listings/new" className="text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
              Sell Item
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/bookmarks" className="text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
                  Bookmarks
                </Link>
                <Link to="/profile" className="text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
                  Profile
                </Link>
                <Link to="/logout" className="text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-sm font-medium transition duration-300">
                  Login
                </Link>
                <Link to="/signup" className="bg-[#3498db] hover:bg-[#2980b9] text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="md:hidden bg-[#2c3e50] px-4 pt-2 pb-4 shadow-inner"
        >
          <Link to="/" className="block text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-base font-medium" onClick={toggleMobileMenu}>
            Home
          </Link>
          <Link to="/categories" className="block text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-base font-medium" onClick={toggleMobileMenu}>
            Categories
          </Link>
          <Link to="/listings/new" className="block text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-base font-medium" onClick={toggleMobileMenu}>
            Sell Item
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/bookmarks" className="block text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-base font-medium" onClick={toggleMobileMenu}>
                Bookmarks
              </Link>
              <Link to="/profile" className="block text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-base font-medium" onClick={toggleMobileMenu}>
                Profile
              </Link>
              <Link to="/logout" className="block text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-base font-medium" onClick={toggleMobileMenu}>
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-base font-medium" onClick={toggleMobileMenu}>
                Login
              </Link>
              <Link to="/signup" className="block text-white hover:bg-opacity-20 hover:bg-white px-3 py-2 rounded-md text-base font-medium bg-[#3498db] mt-2" onClick={toggleMobileMenu}>
                Sign Up
              </Link>
            </>
          )}
        </motion.div>
      )}
    </header>
  );

  // Main component render
  return (
    <div className="min-h-screen flex flex-col">
      {/* Render Header Component */}
      <Header />
      
      {/* Toast Container for notifications */}
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
      
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#2c3e50] text-white py-12 md:py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2 text-center md:text-left">
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-3xl font-extrabold sm:text-4xl md:text-5xl lg:text-6xl"
                >
                  Buy and Sell<br/>Pre-loved Items
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="mt-6 text-lg md:text-xl max-w-2xl"
                >
                  Thriftify helps you find unique items at amazing prices while giving your unused items a second life.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                >
                  <Link 
                    to="/listings/new" 
                    className="bg-white text-[#2c3e50] font-semibold px-6 py-3 rounded-md shadow hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1 text-center"
                  >
                    Sell an Item
                  </Link>
                  <Link 
                    to="/categories" 
                    className="bg-[#3498db] text-white font-semibold px-6 py-3 rounded-md shadow hover:bg-[#2980b9] transition duration-300 transform hover:-translate-y-1 text-center"
                  >
                    Browse Categories
                  </Link>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="md:w-1/2 mt-8 md:mt-0 relative"
              >
                <img 
                  src="https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" 
                  alt="Thrift Shopping" 
                  className="rounded-lg shadow-xl w-full object-cover h-64 md:h-80 lg:h-96"
                />
              </motion.div>
            </div>
          </div>
        </motion.section>
        
        {/* Search & Filter Section */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="mb-6 relative">
              <form onSubmit={handleSearch} className="flex w-full">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search for items..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-[#3498db]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                <button 
                  type="submit" 
                  className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-3 rounded-r-md transition duration-300"
                >
                  Search
                </button>
              </form>
            </div>
            
            {/* Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm"
            >
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-[#3498db]"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  placeholder="Enter city name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-[#3498db]"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-[#3498db]"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full bg-[#3498db] hover:bg-[#2980b9] text-white py-2 px-4 rounded-md transition duration-300 flex justify-center items-center gap-2"
                >
                  <FaFilter /> Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Listings Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">Available Listings</span>
              {loading && (
                <div className="w-5 h-5 border-2 border-t-[#3498db] border-gray-200 rounded-full animate-spin ml-2"></div>
              )}
            </h2>
            
            {/* Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map(item => (
                  <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="bg-gray-300 h-48 w-full"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-10 bg-gray-300 rounded w-full mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {listings.map((listing) => (
                  <motion.div 
                    key={listing._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={listing.images && listing.images.length ? listing.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'} 
                        alt={listing.title || 'Product'} 
                        className="w-full h-full object-cover transition duration-300 hover:scale-105"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleBookmarkToggle(listing._id)}
                          className="bg-white p-2 rounded-full shadow-md transition duration-300 transform hover:scale-110"
                        >
                          {userBookmarks.some(bookmark => 
                            bookmark.listingId === listing._id || 
                            bookmark._id === listing._id || 
                            (bookmark.listing && bookmark.listing._id === listing._id)
                          ) ? (
                            <FaBookmark className="text-[#e74c3c]" />
                          ) : (
                            <FaRegBookmark className="text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <Link to={`/listings/${listing._id}`}>
                        <h3 className="text-lg font-medium text-gray-800 hover:text-[#3498db] transition duration-300 line-clamp-1">
                          {listing.title || 'No Title'}
                        </h3>
                      </Link>
                      <div className="text-[#27ae60] text-xl font-bold mt-2">₹{listing.price || 'N/A'}</div>
                      <p className="text-gray-600 text-sm mt-2 mb-3 line-clamp-2">{listing.description || 'No Description'}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                        <span className="flex items-center">
                          <FaTag className="mr-1" /> {listing.category || 'N/A'}
                        </span>
                        <span className="flex items-center">
                          <FaMapMarkerAlt className="mr-1" /> {listing.location || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center mt-3 text-xs text-gray-500">
                        <FaUserCircle className="mr-1 text-[#3498db]" /> 
                        <span>{listing.postedBy?.fullname || 'Unknown'}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link 
                          to={`/listings/${listing._id}`}
                          className="flex-1 bg-[#27ae60] hover:bg-[#219653] text-white text-center py-2 rounded transition duration-300"
                        >
                          <FaShoppingCart className="inline mr-1" /> Buy Now
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-5xl text-gray-300 mb-4">
                  <FaSearch className="mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No listings found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      category: '',
                      location: '',
                      sortBy: 'desc'
                    });
                  }}
                  className="mt-6 bg-[#3498db] hover:bg-[#2980b9] text-white py-2 px-6 rounded-md transition duration-300"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Popular Categories</h2>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {/* Category Cards with icons from react-icons */}
              {[
                { name: 'Electronics', icon: '💻' },
                { name: 'Clothing', icon: '👕' },
                { name: 'Furniture', icon: '🛋️' },
                { name: 'Books', icon: '📚' },
                { name: 'Sports', icon: '⚽' },
                { name: 'Others', icon: '🔮' }
              ].map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-lg shadow-sm p-5 text-center cursor-pointer transition duration-300"
                  onClick={() => {
                    setFilters({
                      ...filters,
                      category: category.name.toLowerCase()
                    });
                    fetchListings();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="text-gray-800 font-medium">{category.name}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      
      {/* Add Listing Floating Button */}
      {isAuthenticated && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={() => setShowAddListingModal(true)}
            className="bg-[#3498db] hover:bg-[#2980b9] w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white transition duration-300"
            aria-label="Add new listing"
          >
            <FaPlus className="w-6 h-6" />
          </button>
        </motion.div>
      )}

      {/* Add Listing Modal */}
      {showAddListingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-[#2c3e50] text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">List Your Item</h2>
              <button onClick={() => setShowAddListingModal(false)} className="text-white hover:text-gray-300">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db]"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="itemCategory"
                    name="category"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db]"
                    required
                  >
                    <option value="" disabled selected>Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="itemLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="itemLocation"
                    name="location"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                    Images (Max 5) *
                  </label>
                  <input
                    type="file"
                    id="images"
                    name="images"
                    accept="image/*"
                    multiple
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db]"
                    required
                  />
                  <div className="mt-2 flex flex-wrap gap-2" id="imagePreview"></div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-[#27ae60] hover:bg-[#219653] text-white py-3 rounded-md transition duration-300 font-medium"
                >
                  List Item
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#2c3e50] text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#3498db]">Thriftify</h3>
              <p className="text-gray-300 mb-4">Thriftify is a platform for buying and selling pre-loved items, helping reduce waste and give items a second life.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#3498db]">Categories</h3>
              <ul className="space-y-2">
                {categories.slice(0, 5).map(category => (
                  <li key={category}>
                    <Link 
                      to={`/categories/${category}`} 
                      className="text-gray-300 hover:text-white hover:translate-x-1 transition duration-300 flex items-center"
                    >
                      <span className="mr-2">❯</span>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#3498db]">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-300 hover:text-white hover:translate-x-1 transition duration-300 flex items-center"><span className="mr-2">❯</span>About Us</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white hover:translate-x-1 transition duration-300 flex items-center"><span className="mr-2">❯</span>Contact</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white hover:translate-x-1 transition duration-300 flex items-center"><span className="mr-2">❯</span>Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-white hover:translate-x-1 transition duration-300 flex items-center"><span className="mr-2">❯</span>Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#3498db]">Connect With Us</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-gray-300 hover:text-white hover:scale-110 transition duration-300 text-xl">
                  <span className="sr-only">Facebook</span>
                  <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[#3498db]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </span>
                </a>
                <a href="#" className="text-gray-300 hover:text-white hover:scale-110 transition duration-300 text-xl">
                  <span className="sr-only">Twitter</span>
                  <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[#3498db]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </span>
                </a>
                <a href="#" className="text-gray-300 hover:text-white hover:scale-110 transition duration-300 text-xl">
                  <span className="sr-only">Instagram</span>
                  <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[#3498db]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                  </span>
                </a>
                <a href="#" className="text-gray-300 hover:text-white hover:scale-110 transition duration-300 text-xl">
                  <span className="sr-only">LinkedIn</span>
                  <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[#3498db]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </span>
                </a>
              </div>
              
              <p className="text-sm text-gray-400">
                Subscribe to our newsletter for exclusive deals and updates
              </p>
              <div className="mt-3 flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-700 text-white px-3 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#3498db] w-full"
                />
                <button className="bg-[#3498db] hover:bg-[#2980b9] text-white px-4 py-2 rounded-r-md transition duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Thriftify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
