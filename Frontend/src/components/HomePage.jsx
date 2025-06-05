import React from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-primary-600">Thriftify</div>
            </div>
            <nav className="flex space-x-4">
              <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link to="/categories" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Categories</Link>
              <Link to="/listings/new" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Sell Item</Link>
              <Link to="/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
            </nav>
          </div>
        </div>
      </header>
      
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
        {/* Hero Section */}
        <section className="bg-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                Buy and Sell Pre-loved Items
              </h1>
              <p className="mt-6 text-xl max-w-3xl mx-auto">
                Thriftify helps you find unique items at amazing prices while giving your unused items a second life.
              </p>
              <div className="mt-10">
                <Link to="/listings/new" className="inline-block bg-white text-primary-600 font-semibold px-6 py-3 rounded-md shadow hover:bg-gray-100 transition duration-300 mr-4">
                  Sell an Item
                </Link>
                <Link to="/categories" className="inline-block bg-primary-700 text-white font-semibold px-6 py-3 rounded-md shadow hover:bg-primary-800 transition duration-300">
                  Browse Categories
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Items Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Items</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Featured Item Cards (placeholders) */}
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-200 h-48"></div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800">Featured Item {item}</h3>
                    <p className="text-primary-600 font-bold mt-1">₹{(Math.random() * 1000 + 500).toFixed(2)}</p>
                    <p className="text-gray-500 text-sm mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  </div>
                </div>
              ))}
            </div>
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

// Also provide a default export for compatibility
export default HomePage;
