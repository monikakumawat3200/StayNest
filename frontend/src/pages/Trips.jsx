import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Trips = () => {
  const { token, API_URL } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    fetchTrips();
  }, [token]);

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/bookings/my-trips`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();

      if (result.success) {
        setBookings(result.data);
      } else {
        setError(result.message || 'Failed to retrieve bookings.');
      }
    } catch (err) {
      setError('Connection issues fetching bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();

      if (result.success) {
        setBookings((prev) => prev.filter((booking) => booking._id !== bookingId));
      } else {
        alert(result.message || 'Failed to cancel reservation');
      }
    } catch (err) {
      alert('Error cancelling booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px', fontWeight: 600 }}>Trips</h1>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2>Loading your trips...</h2>
        </div>
      ) : bookings.length === 0 ? (
        /* Empty State */
        <div style={{ padding: '60px 0', borderTop: '1px solid #ebebeb' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>No trips booked... yet!</h2>
          <p style={{ color: 'var(--gray)', fontSize: '15px', marginBottom: '24px', maxWidth: '450px' }}>
            Time to dust off your bags and start planning your next adventure. Browse stays today!
          </p>
          <Link to="/" className="btn btn-outline">Start searching</Link>
        </div>
      ) : (
        /* Trips List */
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '20px', color: 'var(--light-dark)' }}>
            Where you're going
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {bookings.map((booking) => {
              const listing = booking.listing || {};
              return (
                <div key={booking._id} className="list-item">
                  <img
                    src={listing.images?.[0] || '/images/cabin.jpg'}
                    alt={listing.title}
                    className="list-item-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300';
                    }}
                  />
                  <div className="list-item-details">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 className="list-item-title">{listing.title}</h3>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)', backgroundColor: '#E8F5E9', padding: '4px 8px', borderRadius: '4px' }}>
                          Confirmed
                        </span>
                      </div>
                      <p className="list-item-meta" style={{ marginTop: '4px' }}>
                        Hosted by {listing.host?.name || 'Jane Host'}
                      </p>
                      <div className="list-item-meta" style={{ marginTop: '12px', color: 'var(--dark)', fontWeight: 500 }}>
                        <span style={{ color: 'var(--gray)' }}>Stay:</span> {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ fontSize: '15px' }}>
                        Total Paid: <strong style={{ fontSize: '18px', color: 'var(--dark)' }}>${booking.totalPrice}</strong>
                      </div>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancellingId === booking._id}
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      >
                        {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Reservation'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
