import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/auth';
import { getEquipmentRequests, getSelectionFeedback } from '../utils/localStorage';
import toast from 'react-hot-toast';

/**
 * Navbar Component
 * KLE Tech inspired navigation bar with role-based menu items
 * Features consistent theming and responsive design
 */
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Update current user on route change
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // Update pending requests count for managers
    if (user && (user.role === 'manager' || user.role === 'admin')) {
      const requests = getEquipmentRequests();
      const pendingCount = requests.filter(req => req.status === 'pending').length;
      setPendingRequestsCount(pendingCount);
      
      // Update feedback count for admins
      if (user.role === 'admin') {
        const feedback = getSelectionFeedback();
        setFeedbackCount(feedback.length);
      }
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  // Define navigation links based on user role
  const getNavLinks = () => {
    // Don't show Home link on login page
    const isLoginPage = location.pathname === '/login';
    
    if (!currentUser) {
      // Public/Guest navigation
      return isLoginPage ? [] : [
        { path: '/', label: 'Home' },
      ];
    }

    // Common links for authenticated users
    const baseLinks = isLoginPage ? [] : [
      { path: '/', label: 'Home' },
    ];

    // Role-specific links
    if (currentUser.role === 'admin') {
      return [
        ...baseLinks,
        { path: '/admin-dashboard', label: 'Dashboard' },
        { path: '/equipments', label: 'Equipment' },
        { path: '/damaged-equipment', label: 'Damaged Equipment' },
        { path: '/logs', label: 'Logs' },
        { path: '/admin-feedback', label: `Feedback (${feedbackCount})` },
      ];
    } else if (currentUser.role === 'manager') {
      return [
        ...baseLinks,
        { path: '/manager-dashboard', label: 'Dashboard' },
        { path: '/equipments', label: 'Equipment' },
        { path: '/manager-requests', label: 'Requests' },
        { path: '/issued', label: 'Issued' },
        { path: '/overdue', label: 'Overdue' },
        { path: '/damaged-equipment', label: 'Damaged Equipment' },
        { path: '/logs', label: 'Logs' },
      ];
    } else if (currentUser.role === 'student') {
      return [
        ...baseLinks,
        { path: '/student-dashboard', label: 'Dashboard' },
        { path: '/student-equipments', label: 'Equipment' },
        { path: '/sport-selection-feedback', label: 'Selection Feedback' },
      ];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`bg-gradient-to-r from-primary via-red-700 to-primary-dark text-white shadow-lg fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'shadow-2xl' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition group">
              {/* Logo Image */}
              <div className="flex items-center">
                <img 
                  src="/logo2.0.png" 
                  alt="Sports Inventory Logo" 
                  className="h-14 w-auto"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{display: 'none'}} className="h-14 w-14 bg-white rounded flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              {/* Text */}
              <div className="hidden sm:block">
                <div className="text-xl font-bold leading-tight">KLE Tech Gymkhana</div>
                <div className="text-xs text-gray-300 leading-tight">Inventory Management</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium transition-all relative group ${
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-gray-200 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1">
                  {link.label}
                  {/* Show pending count badge for Requests link */}
                  {link.path === '/manager-requests' && pendingRequestsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1 animate-pulse">
                      {pendingRequestsCount}
                    </span>
                  )}
                </span>
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-white transition-transform origin-left ${
                  isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </Link>
            ))}
          </div>

          {/* Right Section: User Menu */}
          <div className="flex items-center gap-3">
            {/* User Info & Auth Buttons */}
            {currentUser ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                  <p className="text-xs text-gray-300 capitalize">{currentUser.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-primary-dark to-[#6B1111] border-t border-white border-opacity-10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-gray-200 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center justify-between">
                  {link.label}
                  {/* Show pending count badge for Requests link */}
                  {link.path === '/manager-requests' && pendingRequestsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {pendingRequestsCount}
                    </span>
                  )}
                </span>
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            {currentUser ? (
              <div className="border-t border-white border-opacity-10 pt-3 mt-3">
                <div className="px-4 py-2 text-white">
                  <p className="font-semibold">{currentUser.name}</p>
                  <p className="text-sm text-gray-300 capitalize">{currentUser.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 px-4 py-3 rounded-lg text-base font-medium bg-red-500 hover:bg-red-600 text-white transition-all text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-3 rounded-lg text-base font-medium bg-white text-primary hover:bg-gray-100 transition-all text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;