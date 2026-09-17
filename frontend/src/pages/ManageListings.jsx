import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ManageListings = () => {
  const { user, token, API_URL } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'reservations'
  const [listings, setListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [token, activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'listings') {
        // Fetch all properties, filter client side for hosting
        const res = await fetch(`${API_URL}/listings`);
        const result = await res.json();
        if (result.success) {
          const hosted = result.data.filter(
            (item) => (item.host?._id || item.host) === user?._id
          );
          setListings(hosted);
        } else {
          setError(result.message || 'Failed to load properties.');
        }
      } else {
        // Fetch reservations on hosted properties
        const res = await fetch(`${API_URL}/bookings/my-listings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (result.success) {
          setReservations(result.data);
        } else {
          setError(result.message || 'Failed to load reservations.');
        }
      }
    } catch (err) {
      setError('Connection failed. Server might be down.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? All bookings for this property will also be cancelled.')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();

      if (result.success) {
        setListings((prev) => prev.filter((item) => item._id !== listingId));
      } else {
        alert(result.message || 'Failed to delete listing.');
      }
    } catch (err) {
      alert('Error during deletion process.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Hosting Dashboard</h1>
        <Link to="/create-listing" className="btn btn-primary">
          Create New Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          My Properties
        </button>
        <button
          className={`tab ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          Bookings Received
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2>Loading dashboard data...</h2>
        </div>
      ) : activeTab === 'listings' ? (
        /* Listings Tab */
        listings.length === 0 ? (
          <div style={{ padding: '60px 0', borderTop: '1px solid #ebebeb', textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>Become a host on StayNest</h2>
            <p style={{ color: 'var(--gray)', fontSize: '15px', marginBottom: '24px' }}>
              You don't have any properties listed. Share your space and start earning today!
            </p>
            <Link to="/create-listing" className="btn btn-primary">List your space</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {listings.map((listing) => (
              <div key={listing._id} className="list-item">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="list-item-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300';
                  }}
                />
                <div className="list-item-details">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="list-item-title">{listing.title}</h3>
                      <span className="listing-card-category">{listing.category}</span>
                    </div>
                    <p className="list-item-meta" style={{ marginTop: '4px' }}>
                      {listing.location}, {listing.country}
                    </p>
                    <p style={{ marginTop: '8px', fontSize: '15px', fontWeight: 600 }}>
                      ${listing.price} <span style={{ fontWeight: 400, color: 'var(--gray)', fontSize: '14px' }}>/ night</span>
                    </p>
                  </div>
                  <div className="list-item-actions" style={{ marginTop: '16px', alignSelf: 'flex-end' }}>
                    <Link to={`/edit-listing/${listing._id}`} className="btn btn-outline">
                      Edit Listing
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteListing(listing._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Reservations Tab */
        reservations.length === 0 ? (
          <div style={{ padding: '60px 0', borderTop: '1px solid #ebebeb', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '8px' }}>No bookings yet</h2>
            <p style={{ color: 'var(--gray)', fontSize: '15px' }}>
              When guests book your properties, their reservations will show up here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {reservations.map((res) => (
              <div key={res._id} className="list-item">
                <img
                  src={res.listing?.images?.[0] || '/images/cabin.jpg'}
                  alt={res.listing?.title}
                  className="list-item-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300';
                  }}
                />
                <div className="list-item-details">
                  <div>
                    <h3 className="list-item-title" style={{ fontSize: '16px' }}>
                      Booking on: {res.listing?.title}
                    </h3>
                    <p className="list-item-meta" style={{ marginTop: '6px' }}>
                      Guest: <strong>{res.user?.name}</strong> ({res.user?.email})
                    </p>
                    <p className="list-item-meta" style={{ marginTop: '6px', color: 'var(--dark)' }}>
                      Dates: {formatDate(res.checkIn)} – {formatDate(res.checkOut)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--gray)' }}>
                      Total payout: <strong style={{ fontSize: '16px', color: 'var(--success)' }}>${res.totalPrice}</strong>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', backgroundColor: '#E8F5E9', padding: '4px 8px', borderRadius: '4px' }}>
                      Approved
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ManageListings;
