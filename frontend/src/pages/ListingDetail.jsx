import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookingWidget from '../components/BookingWidget';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Heart, ShoppingCart, MessageSquare, MapPin, Star, Sparkles, ChevronLeft, ChevronRight, X, Maximize2, Send, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ListingDetail = () => {
  const { id } = useParams();
  const { API_URL, token, user } = useAuth();
  const { addToCart, cartItems, removeFromCart } = useCart();
  const { showToast } = useToast();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gallery States
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Wishlist toggle state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Reviews States
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewSort, setReviewSort] = useState('newest');
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Messaging / Contact Host Popup States
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Similar Recommendations State
  const [similarHotels, setSimilarHotels] = useState([]);

  // Check if item is already in Cart
  const inCart = cartItems.some((item) => item._id === id);

  // 1. Fetch listing details
  useEffect(() => {
    const fetchListingDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/listings/${id}`);
        const result = await res.json();

        if (result.success) {
          setListing(result.data);
          
          // Track recently viewed stay in local storage
          trackRecentlyViewed(result.data);
        } else {
          setError(result.message || 'Property details not found');
        }
      } catch (err) {
        setError('Error connecting to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [id, API_URL]);

  // 2. Fetch Wishlist status and Reviews
  useEffect(() => {
    if (!listing) return;
    fetchReviews();
    fetchWishlistStatus();
    fetchSimilarHotels();
  }, [listing, reviewSort]);

  // 3. Dynamically Load Leaflet Map inside Listing Details
  useEffect(() => {
    if (!listing || !listing.lat || !listing.lng) return;

    // Load CSS
    let leafCss = document.getElementById('leaflet-css');
    if (!leafCss) {
      leafCss = document.createElement('link');
      leafCss.id = 'leaflet-css';
      leafCss.rel = 'stylesheet';
      leafCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafCss);
    }

    // Load JS script
    let leafJs = document.getElementById('leaflet-js');
    if (!leafJs) {
      leafJs = document.createElement('script');
      leafJs.id = 'leaflet-js';
      leafJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(leafJs);
    }

    const initializeMap = () => {
      if (window.L) {
        const container = document.getElementById('listing-map-container');
        if (container) {
          container.innerHTML = '';
          const mapEl = document.createElement('div');
          mapEl.style.height = '350px';
          mapEl.style.width = '100%';
          mapEl.style.borderRadius = '16px';
          mapEl.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.15)';
          mapEl.style.border = '1px solid rgba(255,255,255,0.1)';
          container.appendChild(mapEl);

          const map = window.L.map(mapEl).setView([listing.lat, listing.lng], 13);
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          window.L.marker([listing.lat, listing.lng]).addTo(map)
            .bindPopup(`<b>${listing.title}</b><br/>${listing.location}`)
            .openPopup();
        }
      }
    };

    if (window.L) {
      initializeMap();
    } else {
      leafJs.addEventListener('load', initializeMap);
    }
  }, [listing]);

  const trackRecentlyViewed = (property) => {
    try {
      const saved = localStorage.getItem('staynest_recently_viewed');
      let list = saved ? JSON.parse(saved) : [];
      
      // Remove duplicate if exists
      list = list.filter(item => item._id !== property._id);
      // Prepend to top
      list.unshift({
        _id: property._id,
        title: property.title,
        price: property.price,
        location: property.location,
        images: property.images,
        averageRating: property.averageRating
      });
      // Cap at 6 items
      if (list.length > 6) list.pop();
      
      localStorage.setItem('staynest_recently_viewed', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to log viewed history:', e);
    }
  };

  const fetchWishlistStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        const liked = result.data.some(item => item._id === id);
        setIsWishlisted(liked);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await fetch(`${API_URL}/listings/${id}/reviews?sort=${reviewSort}`);
      const result = await res.json();
      if (result.success) {
        setReviews(result.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchSimilarHotels = async () => {
    try {
      const res = await fetch(`${API_URL}/listings?category=${listing.category}&limit=5`);
      const result = await res.json();
      if (result.success) {
        // Exclude current listing
        const filtered = result.data.filter(item => item._id !== id).slice(0, 4);
        setSimilarHotels(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleWishlist = async () => {
    if (!token) {
      showToast('Please log in to save properties to your wishlist', 'warning');
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await fetch(`${API_URL}/wishlist/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setIsWishlisted(result.added);
        showToast(result.message, 'success');
      }
    } catch (err) {
      showToast('Error syncing wishlist state', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Please log in to write a review', 'warning');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/listings/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingInput, comment: commentInput })
      });
      const result = await res.json();
      if (result.success) {
        showToast('Review submitted successfully!', 'success');
        setCommentInput('');
        fetchReviews();
        // Reload listing stats
        const resListing = await fetch(`${API_URL}/listings/${id}`);
        const resultListing = await resListing.json();
        if (resultListing.success) setListing(resultListing.data);
      } else {
        showToast(result.message || 'Failed to submit review', 'error');
      }
    } catch (err) {
      showToast('Server error.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        showToast('Review deleted', 'success');
        fetchReviews();
      }
    } catch (err) {
      showToast('Server error.', 'error');
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!token) {
      showToast('Please log in to helpful-vote reviews', 'warning');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: listing.host?._id,
          listingId: listing._id,
          content: messageText.trim()
        })
      });
      const result = await res.json();
      if (result.success) {
        showToast('Message sent to host inbox!', 'success');
        setMessageText('');
        setMessageOpen(false);
      }
    } catch (err) {
      showToast('Failed to send message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // Image sliders navigation
  const prevImage = () => {
    setActiveImgIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
  };
  const nextImage = () => {
    setActiveImgIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-white">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-4 text-white">
      {/* Back link */}
      <Link to="/" className="text-white-50 text-decoration-none d-inline-flex align-items-center gap-2 mb-4">
        <ChevronLeft size={16} /> Back to explore
      </Link>

      {/* Header Info */}
      <div className="detail-header mb-4">
        <h1 className="fw-bold mb-2">{listing.title}</h1>
        <div className="d-flex flex-wrap align-items-center gap-3 text-white-50 small">
          <span className="d-flex align-items-center gap-1">
            <Star size={14} className="text-warning fill-warning" />
            <span className="text-white fw-bold">{listing.averageRating || '0'}</span>
            <span>({listing.reviewCount || 0} reviews)</span>
          </span>
          <span>•</span>
          <span className="d-flex align-items-center gap-1">
            <MapPin size={14} className="text-primary" />
            {listing.location}, {listing.country}
          </span>
        </div>
      </div>

      {/* Multi-Image Carousel Gallery */}
      <div className="detail-gallery position-relative mx-auto rounded-4 overflow-hidden shadow-lg">
        <img 
          src={listing.images[activeImgIndex] || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'} 
          alt="" 
          className="w-100 h-100"
          style={{ objectFit: 'cover' }}
        />
        
        {/* Navigation arrows (only if more than 1 image) */}
        {listing.images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="position-absolute top-50 start-0 translate-middle-y ms-3 btn btn-dark rounded-circle p-2 bg-opacity-70 border-0"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage}
              className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-dark rounded-circle p-2 bg-opacity-70 border-0"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Zoom Overlay trigger */}
        <button 
          onClick={() => setLightboxOpen(true)}
          className="position-absolute bottom-0 end-0 m-3 btn btn-dark bg-opacity-70 border-0 d-flex align-items-center gap-2 small px-3 py-2"
        >
          <Maximize2 size={14} /> Fullscreen Lightbox
        </button>

        {/* Image index dot counter indicator */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-1">
          {listing.images.map((_, idx) => (
            <div 
              key={idx}
              className={`rounded-circle ${idx === activeImgIndex ? 'bg-primary' : 'bg-secondary'}`}
              style={{ width: '8px', height: '8px', opacity: idx === activeImgIndex ? 1 : 0.6 }}
            />
          ))}
        </div>
      </div>

      {/* Main Info Column + Booking Side Bar Grid Layout */}
      <div className="detail-layout">
        <div className="detail-info">
          {/* Host Card Section */}
          <div className="p-3 rounded bg-dark-card border border-secondary mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1 fw-bold">Entire {listing.category} hosted by {listing.host?.name || 'Jane'}</h5>
              <span className="small text-white-50">Guests capacity: {listing.maxGuests || 4} guests</span>
            </div>
            <img 
              src={listing.host?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
              alt={listing.host?.name} 
              className="rounded-circle border border-primary"
              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
            />
          </div>

          {/* Description Section */}
          <div className="mb-5">
            <h4 className="fw-bold mb-3">About this space</h4>
            <p className="text-white-50 leading-relaxed">{listing.description}</p>
          </div>

          {/* Facilities Amenities section */}
          <div className="mb-5">
            <h4 className="fw-bold mb-3">What this place offers</h4>
            <div className="row row-cols-md-2 g-3">
              {listing.facilities?.map((f, idx) => (
                <div key={idx} className="col d-flex align-items-center gap-3 py-1">
                  <Sparkles size={16} className="text-primary" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <div className="mb-5">
            <h4 className="fw-bold mb-3">Where you'll be</h4>
            <div id="listing-map-container" />
          </div>

          {/* Reviews list section */}
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Guest Reviews ({reviews.length})</h4>
              <select 
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
                className="form-select form-select-sm bg-dark border-secondary text-white"
                style={{ width: '150px' }}
              >
                <option value="newest">Newest</option>
                <option value="highest_rated">Highest Rated</option>
                <option value="lowest_rated">Lowest Rated</option>
              </select>
            </div>

            {/* Review creation form */}
            {token && (
              <form onSubmit={handlePostReview} className="p-4 rounded bg-dark-card border border-secondary mb-4">
                <h6 className="fw-bold mb-3 text-gradient-primary">Leave a star rating & review</h6>
                <div className="mb-3 d-flex align-items-center gap-2">
                  <span className="small text-white-50">Rating Score:</span>
                  <div className="d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setRatingInput(stars)}
                        className="btn btn-link p-0 text-decoration-none"
                      >
                        <Star 
                          size={20} 
                          className={stars <= ratingInput ? 'text-warning fill-warning' : 'text-white-50'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <textarea 
                    className="form-control bg-dark border-secondary text-white" 
                    rows="3"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Tell other travelers about your stay..."
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submittingReview}
                  className="btn btn-primary btn-sm px-4"
                >
                  {submittingReview ? 'Posting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* Reviews list panel */}
            {loadingReviews ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-white-50 small">No reviews posted yet for this listing. Be the first!</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviews.map((rev) => {
                  const isMyReview = user && rev.user?._id === user._id;
                  return (
                    <div key={rev._id} className="p-3 rounded bg-dark-card border border-secondary">
                      <div className="d-flex justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img 
                            src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                            alt="" 
                            className="rounded-circle"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-0 small fw-bold">{rev.user?.name}</h6>
                            <span className="small text-white-50" style={{ fontSize: '9px' }}>
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-1 text-warning small">
                          <Star size={12} className="fill-warning" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      
                      <p className="card-text text-white-50 small mb-2">{rev.comment}</p>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <button 
                          onClick={() => handleLikeReview(rev._id)}
                          className="btn btn-link btn-sm text-white-50 p-0 text-decoration-none small d-flex align-items-center gap-1"
                        >
                          Helpful ({rev.helpfulLikes?.length || 0})
                        </button>
                        {isMyReview && (
                          <button 
                            onClick={() => handleDeleteReview(rev._id)}
                            className="btn btn-link text-danger p-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Side Column: Booking Widget + Cart Action + Message Host */}
        <div className="detail-sidebar">
          <div className="d-flex flex-column gap-4 position-sticky" style={{ top: '100px' }}>
            <BookingWidget listing={listing} />

            {/* Cart Actions Card */}
            <div className="glass-card p-4">
              <h5 className="fw-bold mb-3">Manage Cart & Wishlist</h5>
              <div className="d-flex flex-column gap-2">
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className="btn btn-outline-light w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <Heart className={`text-danger ${isWishlisted ? 'fill-danger' : ''}`} size={16} />
                  {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                </button>

                <button
                  onClick={() => inCart ? removeFromCart(id) : addToCart(listing)}
                  className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 ${inCart ? 'btn-danger' : 'btn-primary'}`}
                >
                  <ShoppingCart size={16} />
                  {inCart ? 'Remove from Cart' : 'Add to Cart / Queue Booking'}
                </button>
              </div>
            </div>

            {/* Direct Contact Host Actions Card */}
            <div className="glass-card p-4">
              <h5 className="fw-bold mb-2">Have a question?</h5>
              <p className="small text-white-50 mb-3">Send a message directly to owner {listing.host?.name}.</p>
              <button 
                onClick={() => setMessageOpen(true)}
                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              >
                <MessageSquare size={16} /> Contact Host / Owner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Hotels Grid Panel */}
      {similarHotels.length > 0 && (
        <div className="similar-hotels-section">
          <h4 className="fw-bold mb-3" style={{ fontSize: '18px' }}>
            Recommended Hotels (Similar Stays)
          </h4>
          <div className="similar-hotels-grid">
            {similarHotels.map((lst) => (
              <Link 
                key={lst._id} 
                to={`/listings/${lst._id}`} 
                className="similar-hotel-card"
              >
                <div className="similar-hotel-thumb-wrapper">
                  <img 
                    src={lst.images[0] || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'} 
                    alt={lst.title} 
                    className="similar-hotel-thumb"
                  />
                </div>
                <div className="similar-hotel-content">
                  <h6 className="similar-hotel-title" title={lst.title}>
                    {lst.title}
                  </h6>
                  <p className="similar-hotel-location" title={lst.location}>
                    {lst.location}
                  </p>
                  <div className="similar-hotel-footer">
                    <span className="similar-hotel-price">
                      ${lst.price} <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-muted)' }}>/ night</span>
                    </span>
                    <span className="similar-hotel-rating">
                      <Star size={11} className="fill-warning text-warning" /> {lst.averageRating || '0'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Message Host Modal Dialog overlay */}
      <AnimatePresence>
        {messageOpen && (
          <div 
            className="modal-overlay d-flex align-items-center justify-content-center"
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-4 text-white"
              style={{ width: '400px' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Message Host</h5>
                <button onClick={() => setMessageOpen(false)} className="btn btn-link text-white p-0">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSendMessage}>
                <div className="mb-3">
                  <textarea 
                    className="form-control bg-dark border-secondary text-white" 
                    rows="4"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Hi ${listing.host?.name || 'Owner'}, I have a question about booking dates...`}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={sendingMessage}
                  className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <Send size={16} />
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox Open State */}
      <AnimatePresence>
        {lightboxOpen && (
          <div 
            className="modal-overlay d-flex align-items-center justify-content-center"
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'black',
              zIndex: 10000
            }}
          >
            <button 
              onClick={() => setLightboxOpen(false)}
              className="position-absolute top-0 end-0 m-4 btn btn-link text-white text-decoration-none"
            >
              <X size={32} />
            </button>
            <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center p-3">
              <img 
                src={listing.images[activeImgIndex]} 
                alt="" 
                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
              />
              {listing.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="position-absolute top-50 start-0 translate-middle-y ms-4 btn btn-dark rounded-circle p-3 bg-opacity-70 border-0"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="position-absolute top-50 end-0 translate-middle-y me-4 btn btn-dark rounded-circle p-3 bg-opacity-70 border-0"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListingDetail;
