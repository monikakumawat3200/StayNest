import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Calendar, Users, Trash2, ShieldCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { token, API_URL } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Booking states map for each listing in cart
  // Key: listingId, Value: { checkIn, checkOut, guests }
  const [bookingInputs, setBookingInputs] = useState(() => {
    const inputs = {};
    for (const item of cartItems) {
      inputs[item._id] = {
        checkIn: '',
        checkOut: '',
        guests: 1
      };
    }
    return inputs;
  });

  const handleInputChange = (listingId, field, value) => {
    setBookingInputs((prev) => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        [field]: value
      }
    }));
  };

  const calculateDays = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleCheckoutItem = async (item) => {
    const inputs = bookingInputs[item._id];
    if (!inputs?.checkIn || !inputs?.checkOut) {
      showToast(`Please select booking dates for ${item.title}`, 'warning');
      return;
    }

    const diffDays = calculateDays(inputs.checkIn, inputs.checkOut);
    if (diffDays <= 0) {
      showToast('Check-out date must be after check-in date', 'warning');
      return;
    }

    try {
      // 1. Create booking in DB
      const resBooking = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: item._id,
          checkIn: inputs.checkIn,
          checkOut: inputs.checkOut,
          guestsCount: inputs.guests
        })
      });
      const resultBooking = await resBooking.json();
      
      if (!resultBooking.success) {
        showToast(resultBooking.message || 'Failed to create booking', 'error');
        return;
      }

      const bookingId = resultBooking.data._id;

      // 2. Request simulated Stripe checkout
      const resStripe = await fetch(`${API_URL}/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
      });
      const resultStripe = await resStripe.json();

      if (resultStripe.success) {
        showToast('Redirecting to Stripe checkout...', 'success');
        // Remove item from cart since booking is created and checkout started
        removeFromCart(item._id);
        navigate(resultStripe.url);
      } else {
        showToast('Payment initialization failed', 'error');
      }
    } catch (err) {
      showToast('Error processing checkout. Please try again.', 'error');
    }
  };

  return (
    <div className="container py-5 mt-4 text-white">
      <div className="d-flex align-items-center gap-3 mb-5">
        <ShoppingCart className="text-primary" size={32} />
        <h2 className="mb-0 fw-bold text-gradient-primary">Shopping Cart / Listings Cart</h2>
      </div>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-5 glass-card"
        >
          <div className="mb-3">
            <ShoppingCart size={48} className="text-white-50" />
          </div>
          <h3>Your cart is empty</h3>
          <p className="text-white-50 max-width-500 mx-auto mb-4">
            Browse our catalog, pick your dates, and add properties to your checkout cart to book them.
          </p>
          <Link to="/" className="btn btn-primary px-4 py-2">
            Explore Hotels
          </Link>
        </motion.div>
      ) : (
        <div className="row g-4">
          {/* Left: Cart Items List */}
          <div className="col-lg-8">
            <div className="d-flex flex-column gap-3">
              <AnimatePresence>
                {cartItems.map((item) => {
                  const inputs = bookingInputs[item._id] || { checkIn: '', checkOut: '', guests: 1 };
                  const days = calculateDays(inputs.checkIn, inputs.checkOut);
                  const totalPrice = days * item.price;

                  return (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="card bg-dark-card border-secondary text-white p-3 shadow"
                    >
                      <div className="row g-3">
                        <div className="col-md-3">
                          <img 
                            src={item.images[0] || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'} 
                            alt={item.title} 
                            className="rounded w-100 h-100"
                            style={{ objectFit: 'cover', minHeight: '120px' }}
                          />
                        </div>
                        
                        <div className="col-md-9 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-start">
                              <h5 className="fw-bold mb-1">{item.title}</h5>
                              <button 
                                onClick={() => removeFromCart(item._id)}
                                className="btn btn-link text-danger p-0"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <p className="text-white-50 small mb-3">{item.location}, {item.country}</p>
                          </div>

                          {/* Inputs Row */}
                          <div className="row g-2 align-items-end mb-3">
                            <div className="col-6 col-sm-4">
                              <label className="small text-white-50 mb-1 d-flex align-items-center gap-1">
                                <Calendar size={12} /> Check-in
                              </label>
                              <input 
                                type="date" 
                                className="form-control form-control-sm bg-dark border-secondary text-white" 
                                value={inputs.checkIn}
                                onChange={(e) => handleInputChange(item._id, 'checkIn', e.target.value)}
                              />
                            </div>
                            <div className="col-6 col-sm-4">
                              <label className="small text-white-50 mb-1 d-flex align-items-center gap-1">
                                <Calendar size={12} /> Check-out
                              </label>
                              <input 
                                type="date" 
                                className="form-control form-control-sm bg-dark border-secondary text-white" 
                                value={inputs.checkOut}
                                onChange={(e) => handleInputChange(item._id, 'checkOut', e.target.value)}
                              />
                            </div>
                            <div className="col-12 col-sm-4">
                              <label className="small text-white-50 mb-1 d-flex align-items-center gap-1">
                                <Users size={12} /> Guests
                              </label>
                              <select 
                                className="form-select form-select-sm bg-dark border-secondary text-white" 
                                value={inputs.guests}
                                onChange={(e) => handleInputChange(item._id, 'guests', Number(e.target.value))}
                              >
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                  <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Calculations & Purchase Button */}
                          <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
                            <div>
                              <span className="small text-white-50">${item.price} x {days} nights = </span>
                              <span className="fw-bold text-primary">${totalPrice || 0}</span>
                            </div>
                            <button 
                              onClick={() => handleCheckoutItem(item)}
                              className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                            >
                              <CreditCard size={14} />
                              Book & Pay Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Checkout Safety Summary */}
          <div className="col-lg-4">
            <div className="glass-card p-4 text-white">
              <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <ShieldCheck className="text-primary" />
                StayNest Booking Guarantee
              </h4>
              <p className="small text-white-50">
                All checkout transactions are safely routed and encrypted through our simulated payment processor test portal.
              </p>
              <ul className="small text-white-50 list-unstyled d-flex flex-column gap-2 mb-4">
                <li>✓ Free cancellation up to 24h prior to check-in.</li>
                <li>✓ 24/7 client helpline for property assistance.</li>
                <li>✓ Host accountability and damage cover.</li>
              </ul>
              <button 
                onClick={clearCart} 
                className="btn btn-outline-danger btn-sm w-100"
              >
                Clear Entire Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
