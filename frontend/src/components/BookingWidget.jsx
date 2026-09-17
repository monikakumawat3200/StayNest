import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const BookingWidget = ({ listing }) => {
  const { user, token, API_URL } = useAuth();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [nights, setNights] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculate nights whenever checkIn or checkOut changes
  useEffect(() => {
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      if (outDate > inDate) {
        const diffTime = Math.abs(outDate - inDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNights(diffDays);
        setError('');
      } else {
        setNights(0);
      }
    } else {
      setNights(0);
    }
  }, [checkIn, checkOut]);

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    // Reset checkOut if it is before or equal to the new checkIn
    if (checkOut && new Date(checkOut) <= new Date(val)) {
      setCheckOut('');
    }
  };

  const handleReserve = async () => {
    if (!token) {
      setAuthModalOpen(true);
      return;
    }

    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: listing._id,
          checkIn,
          checkOut,
        }),
      });

      const result = await res.json();

      if (result.success) {
        const bookingId = result.data._id;
        try {
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
            navigate(resultStripe.url);
            return;
          }
        } catch (e) {
          console.error(e);
        }
        navigate('/trips');
      } else {
        setError(result.message || 'Booking reservation failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fees calculation
  const basePrice = listing.price * nights;
  const cleaningFee = nights > 0 ? 40 : 0;
  const serviceFee = nights > 0 ? Math.round(basePrice * 0.1) : 0;
  const totalPrice = basePrice + cleaningFee + serviceFee;

  return (
    <div className="booking-widget">
      <div className="widget-price">
        <span>${listing.price}</span> / night
      </div>

      {error && <div className="alert-error" style={{ fontSize: '13px' }}>{error}</div>}

      <div className="widget-dates">
        <div className="date-input-group">
          <label htmlFor="check-in">Check-In</label>
          <input
            type="date"
            id="check-in"
            min={today}
            value={checkIn}
            onChange={handleCheckInChange}
            required
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="check-out">Check-Out</label>
          <input
            type="date"
            id="check-out"
            min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            disabled={!checkIn}
            required
          />
        </div>
      </div>

      {user?._id === listing.host?._id || user?._id === listing.host ? (
        <button className="widget-btn" disabled style={{ backgroundColor: 'var(--gray)', cursor: 'not-allowed' }}>
          This is your listing
        </button>
      ) : (
        <button className="widget-btn" onClick={handleReserve} disabled={loading}>
          {loading ? 'Reserving...' : token ? 'Reserve' : 'Log in to Reserve'}
        </button>
      )}

      {nights > 0 && (
        <div className="widget-calc">
          <p className="widget-note">You won't be charged yet</p>
          <div className="calc-row">
            <span>${listing.price} x {nights} nights</span>
            <span>${basePrice}</span>
          </div>
          <div className="calc-row">
            <span>Cleaning fee</span>
            <span>${cleaningFee}</span>
          </div>
          <div className="calc-row">
            <span>StayNest service fee</span>
            <span>${serviceFee}</span>
          </div>
          <div className="calc-row calc-total">
            <span>Total before taxes</span>
            <span>${totalPrice}</span>
          </div>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default BookingWidget;
