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
        console.log(error);
        setIsAuthenticated(false);
        console.log('User not authenticated');
      }
    };
    
    checkAuth();
  }, []);

  // Fetch listings when component mounts or filters change
  useEffect(() => {
    // Remove the automatic fetch on filter change
    // Only fetch on initial load
    if (loading && listings.length === 0) {
      fetchListings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user's bookmarks if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBookmarks();
    } else {
      // Ensure userBookmarks is always an array
      setUserBookmarks([]);
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

  const fetchSearchedListings = async () => {
    setLoading(true);
    try {
      let queryString = `?sortOrder=${filters.sortBy}`;
      if (filters.category) queryString += `&category=${encodeURIComponent(filters.category)}`;
      if (filters.location) queryString += `&location=${encodeURIComponent(filters.location)}`;
      if (searchQuery) queryString += `&query=${encodeURIComponent(searchQuery)}`;

      const response = await axios.get(`/api/search${queryString}`);
      console.log('Fetched listings:', response.data);

      const listingsData = response.data.message.listings || [];
      setListings(Array.isArray(listingsData) ? listingsData : []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings. Please try again later.');
      setListings([]);
    } finally {
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

  // Apply filters - now this is the only way to trigger a search after changing filters
  const applyFilters = () => {
    fetchListings();
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchSearchedListings();
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

      console.log('response', response.data.message.isBookmarked);
      
      // Show success toast
      const message = response?.data?.message;
      const action = message.isBookmarked ? 'added to' : 'removed from';

      toast.success(`Item ${action} bookmarks!`);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark. Please try again.');
    }
  };

  return (
    <div>
      {/* Header with Navigation */}
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
      </header>
      
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#2c3e50] text-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-20 hover:bg-white transition duration-300">
              Home
            </Link>
            <Link to="/categories" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-20 hover:bg-white transition duration-300">
              Categories
            </Link>
            <Link to="/listings/new" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-20 hover:bg-white transition duration-300">
              Sell Item
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/bookmarks" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-20 hover:bg-white transition duration-300">
                  Bookmarks
                </Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-20 hover:bg-white transition duration-300">
                  Profile
                </Link>
                <Link to="/logout" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-20 hover:bg-white transition duration-300">
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-20 hover:bg-white transition duration-300">
                  Login
                </Link>
                <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-20 hover:bg-white transition duration-300">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
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
        {/* Search and Filter Section */}
        <section className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold sm:text-5xl text-white">Find Amazing Deals</h1>
              <p className="mt-4 text-xl">Discover pre-loved items at incredible prices</p>
            </div>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for items..."
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
                <FaSearch className="absolute right-3 top-3.5 text-gray-400" />
              </div>
              <div className="sm:w-1/4">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="bg-[#e74c3c] hover:bg-[#c0392b] text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Search
              </button>
            </form>
            
            {/* Filter options */}
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  placeholder="Enter location..."
                  className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
                <FaMapMarkerAlt className="absolute right-3 top-2.5 text-gray-400" />
              </div>
              
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              
              <button
                onClick={applyFilters}
                className="flex items-center gap-2 bg-white text-[#3498db] px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                <FaFilter /> Apply Filters
              </button>
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Featured Listings</h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3498db]"></div>
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
                          {Array.isArray(userBookmarks) && userBookmarks.some(bookmark => 
                            bookmark?.listingId === listing._id || 
                            bookmark?._id === listing._id || 
                            (bookmark?.listing && bookmark?.listing._id === listing._id)
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
                <p className="text-xl text-gray-500">No listings found. Try adjusting your search criteria.</p>
              </motion.div>
            )}
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="py-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Popular Categories</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Category Cards */}
              {['Electronics', 'Clothing', 'Home Decor', 'Books', 'Sports', 'Collectibles'].map((category) => (
                <div key={category} className="bg-white rounded-lg shadow-sm p-4 text-center cursor-pointer hover:shadow-md transition duration-300">
                  <div className="h-16 flex items-center justify-center text-primary-600">
                    <i className="fas fa-tag text-3xl"></i>
                  </div>
                  <h3 className="text-gray-800 font-medium mt-2">{category}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Thriftify</h3>
              <p className="text-gray-300">Thriftify is a platform for buying and selling pre-loved items, helping reduce waste and give items a second life.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white text-xl"><i className="fab fa-facebook"></i></a>
                <a href="#" className="text-gray-300 hover:text-white text-xl"><i className="fab fa-twitter"></i></a>
                <a href="#" className="text-gray-300 hover:text-white text-xl"><i className="fab fa-instagram"></i></a>
                <a href="#" className="text-gray-300 hover:text-white text-xl"><i className="fab fa-linkedin"></i></a>
              </div>
              <p className="mt-4 text-gray-300">© 2025 Thriftify. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
