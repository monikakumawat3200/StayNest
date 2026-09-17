import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Wishlist = () => {
  const { token, API_URL } = useAuth();
  const { showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setWishlistItems(result.data);
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWishlist = async (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/wishlist/${listingId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        showToast('Removed from wishlist!', 'success');
        setWishlistItems((prev) => prev.filter((item) => item._id !== listingId));
      }
    } catch (err) {
      showToast('Error removing from wishlist', 'error');
    }
  };

  return (
    <div className="container py-5 mt-4 text-white">
      <div className="d-flex align-items-center gap-3 mb-5">
        <Heart className="text-danger fill-danger animate-pulse" size={32} />
        <h2 className="mb-0 fw-bold text-gradient-primary">My Saved Wishlist</h2>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : wishlistItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-5 glass-card"
        >
          <div className="mb-3">
            <Heart size={48} className="text-white-50" />
          </div>
          <h3>Your wishlist is empty</h3>
          <p className="text-white-50 max-width-500 mx-auto mb-4">
            Explore homes and click the heart icon on any listing card to save your favorite spots for future reference.
          </p>
          <Link to="/" className="btn btn-primary px-4 py-2">
            Explore Hotels
          </Link>
        </motion.div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          <AnimatePresence>
            {wishlistItems.map((item) => (
              <motion.div 
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="col"
              >
                <Link to={`/listings/${item._id}`} className="text-decoration-none">
                  <div className="card h-100 bg-dark-card border-secondary text-white position-relative hover-lift overflow-hidden">
                    
                    {/* Image Column */}
                    <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                      <img 
                        src={item.images[0] || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'} 
                        alt={item.title} 
                        className="card-img-top w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                      
                      {/* Floating Save button */}
                      <button 
                        onClick={(e) => handleRemoveWishlist(e, item._id)}
                        className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow"
                        style={{ border: 'none', background: 'rgba(255, 255, 255, 0.8)', zIndex: 10 }}
                      >
                        <Heart className="text-danger fill-danger" size={18} />
                      </button>

                      {item.averageRating >= 4.7 && (
                        <div className="position-absolute top-0 start-0 m-3 badge bg-primary d-flex align-items-center gap-1">
                          <Sparkles size={12} /> Guest Favorite
                        </div>
                      )}
                    </div>

                    {/* Card Description */}
                    <div className="card-body d-flex flex-column justify-content-between p-3">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title fw-bold text-truncate mb-0" style={{ maxWidth: '80%' }}>
                            {item.title}
                          </h6>
                          <div className="d-flex align-items-center gap-1 text-warning small">
                            <Star size={14} className="fill-warning" />
                            <span>{item.averageRating || '0'}</span>
                          </div>
                        </div>
                        <p className="card-text text-white-50 small mb-2 d-flex align-items-center gap-1">
                          <MapPin size={12} />
                          {item.location}, {item.country}
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-secondary">
                        <span className="text-white-50 small">Price per night</span>
                        <span className="fw-bold text-primary">${item.price}</span>
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
