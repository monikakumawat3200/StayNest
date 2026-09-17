import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';
import { Heart, ShoppingCart, MessageSquare, Shield, ShieldAlert, User, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [theme, setTheme] = useState(localStorage.getItem('staynest_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('staynest_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Sync search input with URL search param
  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleHostClick = () => {
    if (user) {
      navigate('/create-listing');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleDropdownItemClick = (action) => {
    setDropdownOpen(false);
    if (action === 'profile') {
      navigate('/profile');
    } else if (action === 'trips') {
      navigate('/trips');
    } else if (action === 'messages') {
      navigate('/messages');
    } else if (action === 'owner') {
      navigate('/owner-dashboard');
    } else if (action === 'admin') {
      navigate('/admin-dashboard');
    } else if (action === 'logout') {
      logout();
      navigate('/');
    } else if (action === 'login') {
      setAuthModalOpen(true);
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* LOGO */}
        <div className="logo" onClick={() => { setSearchValue(''); navigate('/'); }}>
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', fill: 'currentcolor', height: '32px', width: '32px' }} aria-hidden="true" role="presentation" focusable="false">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.708-3.386l-.257-.262-.172-.178-.231-.236a28.03 28.03 0 0 1-1.408-1.579l-.153-.186-.109-.138c-.318-.415-.658-.879-.998-1.365a73.917 73.917 0 0 1-1.002 1.37c-.337.48-.675.94-1.04 1.455-.084.116-.17.234-.258.354a27.799 27.799 0 0 1-1.332 1.53c-2.316 2.378-4.72 3.65-7.054 3.65-3.48 0-6.357-2.416-6.357-6.478v-.228c.009-.966.257-1.879.932-3.487l.173-.393c.96-2.235 5.034-10.783 7.075-14.795l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.253.532-3.125 2.084l-.533 1.025c-1.956 3.83-6.096 12.505-7.075 14.795l-.173.393c-.628 1.498-.829 2.224-.864 2.873l-.008.228-.002.114c0 2.88 1.91 4.478 4.357 4.478 1.597 0 3.472-.942 5.485-2.996l.178-.188.163-.178.214-.23c.311-.343.633-.715.965-1.111a43.518 43.518 0 0 0 .97-1.206c.642-.82 1.258-1.666 1.838-2.529l.174-.265.174-.268.046-.073.047-.074.047-.074.053-.085a21.492 21.492 0 0 0 .524-.919l.067-.13.06-.118.06-.118c.241-.483.473-.976.697-1.478l.056-.131.055-.13.05-.121.051-.121a22.25 22.25 0 0 0 .34-.906l.044-.131c.218-.687.397-1.393.533-2.116l.035-.19.034-.19c.046-.289.083-.583.109-.882l.013-.193.012-.193c.007-.225.01-.453.01-.682a20.08 20.08 0 0 0-.063-.984c-.067-.577-.183-1.144-.343-1.696a18.232 18.232 0 0 0-.523-1.395l-.046-.098a21.1 21.1 0 0 0-.524-.92l-.053-.085-.047-.074-.047-.074-.046-.073c-.58-1.002-1.233-1.92-1.92-2.738a43.238 43.238 0 0 0-.91-1.045c-.328.406-.65.787-.962 1.14l-.21.24c-.053.062-.108.125-.164.188-.178.2-.336.38-.475.541-2.03 2.073-3.91 3.018-5.503 3.018-2.447 0-4.357-1.597-4.357-4.478v-.114c.002-.036.004-.074.008-.114.035-.649.236-1.375.864-2.873l.173-.393c.979-2.29 5.119-10.965 7.075-14.795l.533-1.025c.872-1.552 1.886-2.084 3.125-2.084zM16 9c-2.761 0-5 2.239-5 5 0 2.761 2.239 5 5 5s5-2.239 5-5c0-2.761-2.239-5-5-5zm0 2c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3z"></path>
          </svg>
          <span>StayNest</span>
        </div>

        {/* SEARCH BAR */}
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', fill: 'none', height: '12px', width: '12px', stroke: 'currentcolor', strokeWidth: '5.33333px', overflow: 'visible' }} aria-hidden="true" role="presentation" focusable="false">
              <path d="M13 24a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm8-3 9 9"></path>
            </svg>
          </button>
        </form>

        {/* NAV ACTIONS */}
        <div className="nav-actions">
          {/* Theme switcher */}
          <button 
            onClick={toggleTheme}
            className="btn btn-link p-0 d-flex align-items-center justify-content-center"
            style={{ color: 'var(--text-color)', border: 'none', background: 'none', cursor: 'pointer' }}
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user?.role === 'Owner' && (
            <div className="host-link" onClick={handleHostClick}>
              Host your home
            </div>
          )}

          {user && (
            <>
              {/* Messages Inbox Shortcut */}
              <Link to="/messages" className="nav-icon-link" title="Inbox Messages" style={{ position: 'relative', color: 'var(--text-color)' }}>
                <MessageSquare size={20} />
              </Link>

              {/* Wishlist Heart Icon */}
              <Link to="/wishlist" className="nav-icon-link" title="Wishlist" style={{ color: 'var(--text-color)' }}>
                <Heart size={20} />
              </Link>

              {/* Shopping Cart Icon */}
              <Link to="/cart" className="nav-icon-link" title="Cart" style={{ position: 'relative', color: 'var(--text-color)' }}>
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span className="badge rounded-circle bg-danger position-absolute top-0 start-100 translate-middle p-1" style={{ fontSize: '8px', minWidth: '16px', minHeight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </>
          )}

          <div className="profile-dropdown" ref={dropdownRef}>
            <button className="profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt="Profile"
                className="avatar"
              />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                {user ? (
                  <>
                    <div style={{ padding: '12px 20px', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-color)' }}>
                      Hello, {user.name}
                    </div>
                    <button className="dropdown-item" onClick={() => handleDropdownItemClick('profile')}>
                      <User size={14} style={{ marginRight: '8px' }} /> My Profile
                    </button>
                    <button className="dropdown-item" onClick={() => handleDropdownItemClick('trips')}>
                      <LayoutDashboard size={14} style={{ marginRight: '8px' }} /> My Trips
                    </button>
                    <button className="dropdown-item" onClick={() => handleDropdownItemClick('messages')}>
                      <MessageSquare size={14} style={{ marginRight: '8px' }} /> Inbox
                    </button>

                    {user.role === 'Owner' && (
                      <button className="dropdown-item text-primary" onClick={() => handleDropdownItemClick('owner')}>
                        <LayoutDashboard size={14} style={{ marginRight: '8px' }} /> Host Dashboard
                      </button>
                    )}

                    {user.role === 'Admin' && (
                      <button className="dropdown-item text-danger" onClick={() => handleDropdownItemClick('admin')}>
                        <Shield size={14} style={{ marginRight: '8px' }} /> Admin Panel
                      </button>
                    )}

                    <div className="dropdown-divider" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                    <button className="dropdown-item" onClick={() => handleDropdownItemClick('logout')} style={{ color: '#e63946' }}>
                      <LogOut size={14} style={{ marginRight: '8px' }} /> Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button className="dropdown-item" onClick={() => handleDropdownItemClick('login')} style={{ fontWeight: 600 }}>
                      Log In
                    </button>
                    <button className="dropdown-item" onClick={() => handleDropdownItemClick('login')}>
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
