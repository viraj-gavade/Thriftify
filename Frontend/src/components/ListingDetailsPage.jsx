import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaBookmark, FaRegBookmark, FaShoppingCart, FaUser, FaMapMarkerAlt, FaCalendarAlt, FaTag } from 'react-icons/fa';

const ListingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/v1/user/check-auth', { withCredentials: true });
        setIsAuthenticated(response.status === 200);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch listing details
  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/listings/${id}`);
        
        // Depending on your API response structure, adjust this accordingly
        const listingData = response.data.message || response.data;
        setListing(listingData);
        
        // Check if the listing is bookmarked by the user
        if (isAuthenticated) {
          try {
            const bookmarksResponse = await axios.get('/api/v1/user/bookmarks', { withCredentials: true });
            const bookmarks = bookmarksResponse.data || [];
            
            const isInBookmarks = Array.isArray(bookmarks) && bookmarks.some(bookmark => 
              bookmark.listingId === id || 
              bookmark._id === id || 
              (bookmark.listing && bookmark.listing._id === id)
            );
            
            setIsBookmarked(isInBookmarks);
          } catch (error) {
            console.error('Error fetching bookmarks:', error);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listing details:', error);
        toast.error('Failed to load listing details');
        setLoading(false);
      }
    };
    
    fetchListingDetails();
  }, [id, isAuthenticated]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to bookmark items');
      navigate('/login');
      return;
    }
    
    try {
      const response = await axios.post(`/api/v1/bookmarks/toggle/${id}`, {
        listingId: id
      }, { withCredentials: true });
      
      // Toggle bookmark state
      setIsBookmarked(!isBookmarked);
      
      // Show success toast
      const message = response.data?.message || '';
      const action = message.includes('removed') ? 'removed from' : 'added to';
      toast.success(`Item ${action} bookmarks!`);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark. Please try again.');
    }
  };

  // Handle buy now click
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to purchase items');
      navigate('/login');
      return;
    }
    
    // Navigate to checkout or initiate buying process
    navigate(`/checkout/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-[#3498db] border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Listing Not Found</h2>
        <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-3 rounded-md inline-flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Navigation Bar */}
      <div className="bg-[#2c3e50] text-white py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center">
          <Link to="/" className="flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Listings
          </Link>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-[300px] md:h-[400px] overflow-hidden rounded-lg">
                <img 
                  src={listing.images && listing.images.length 
                    ? listing.images[activeImageIndex] 
                    : 'https://via.placeholder.com/600x400?text=No+Image'} 
                  alt={listing.title} 
                  className="w-full h-full object-contain"
                />
                
                {/* Bookmark Button */}
                <button
                  onClick={handleBookmarkToggle}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md transition duration-300 transform hover:scale-110"
                >
                  {isBookmarked ? (
                    <FaBookmark className="text-[#e74c3c]" />
                  ) : (
                    <FaRegBookmark className="text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {listing.images.map((image, index) => (
                    <button 
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                        activeImageIndex === index ? 'border-[#3498db]' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt={`${listing.title} - image ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Listing Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{listing.title}</h1>
                <div className="text-[#27ae60] text-2xl font-bold mt-2">₹{listing.price}</div>
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <div className="flex items-center">
                  <FaTag className="mr-1" /> {listing.category || 'N/A'}
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-1" /> {listing.location || 'N/A'}
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-1" /> Posted on {new Date(listing.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium mb-2">Description</h2>
                <p className="text-gray-700">{listing.description}</p>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-700">
                  <FaUser className="text-[#3498db] mr-2" />
                  <div>
                    <div className="font-medium">{listing.postedBy?.fullname || 'Anonymous'}</div>
                    <div className="text-xs text-gray-500">Seller</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#27ae60] hover:bg-[#219653] text-white py-3 px-4 rounded-md font-medium transition duration-300 flex items-center justify-center"
                >
                  <FaShoppingCart className="mr-2" /> Buy Now
                </button>
                <button
                  onClick={handleBookmarkToggle}
                  className="px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-300"
                >
                  {isBookmarked ? (
                    <FaBookmark className="text-[#e74c3c]" />
                  ) : (
                    <FaRegBookmark className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsPage;
