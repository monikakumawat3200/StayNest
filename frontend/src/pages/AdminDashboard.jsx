import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Home, Star, CreditCard, Trash2, Ban, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { token, API_URL, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalReviews: 0,
    totalBookings: 0,
    totalRevenue: 0,
    usersList: [],
    listingsList: [],
    reviewsList: []
  });

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      showToast('Admin clearance required to access dashboard', 'error');
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/dashboard/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setStats(result.data);
      } else {
        showToast('Failed to load administration data', 'error');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (targetUserId) => {
    try {
      const res = await fetch(`${API_URL}/users/${targetUserId}/block`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        fetchAdminData();
      } else {
        showToast(result.message || 'Block action failed', 'error');
      }
    } catch (err) {
      showToast('Server error.', 'error');
    }
  };

  const handleDeleteUser = async (targetUserId) => {
    if (!window.confirm('Delete user account and all their properties? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/users/${targetUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        fetchAdminData();
      } else {
        showToast(result.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showToast('Server error.', 'error');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to remove this property?')) return;
    try {
      const res = await fetch(`${API_URL}/listings/${listingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        showToast('Listing removed successfully', 'success');
        fetchAdminData();
      } else {
        showToast(result.message || 'Failed to remove listing', 'error');
      }
    } catch (err) {
      showToast('Server error.', 'error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        showToast('Review deleted', 'success');
        fetchAdminData();
      } else {
        showToast(result.message || 'Failed to delete review', 'error');
      }
    } catch (err) {
      showToast('Server error.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-white mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Administration Panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-4 text-white">
      <div className="d-flex align-items-center gap-3 mb-5">
        <Shield className="text-danger" size={32} />
        <h2 className="mb-0 fw-bold text-gradient-primary">Platform Administrator Dashboard</h2>
      </div>

      {/* Admin Overall Statistics Panels */}
      <div className="row g-3 mb-5">
        <div className="col-md-2 col-6">
          <div className="glass-card p-3 text-center">
            <Users className="text-primary mb-2" size={24} />
            <h4 className="fw-bold mb-0">{stats.totalUsers}</h4>
            <span className="text-white-50 small" style={{ fontSize: '11px' }}>Users</span>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="glass-card p-3 text-center">
            <Home className="text-info mb-2" size={24} />
            <h4 className="fw-bold mb-0">{stats.totalListings}</h4>
            <span className="text-white-50 small" style={{ fontSize: '11px' }}>Hotels</span>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="glass-card p-3 text-center">
            <Star className="text-warning mb-2" size={24} />
            <h4 className="fw-bold mb-0">{stats.totalReviews}</h4>
            <span className="text-white-50 small" style={{ fontSize: '11px' }}>Reviews</span>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="glass-card p-3 text-center">
            <CreditCard className="text-success mb-2" size={24} />
            <h4 className="fw-bold mb-0">{stats.totalBookings}</h4>
            <span className="text-white-50 small" style={{ fontSize: '11px' }}>Bookings</span>
          </div>
        </div>
        <div className="col-md-3 col-12">
          <div className="glass-card p-3 text-center">
            <CreditCard className="text-primary mb-2" size={24} />
            <h4 className="fw-bold mb-0">${stats.totalRevenue}</h4>
            <span className="text-white-50 small" style={{ fontSize: '11px' }}>Total Platform Revenue</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom border-secondary pb-3">
        {['users', 'hotels', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn btn-sm px-4 py-2 text-capitalize ${activeTab === tab ? 'btn-primary' : 'btn-outline-secondary text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Moderation Tables container */}
      <div className="glass-card p-4">
        {activeTab === 'users' && (
          <div>
            <h4 className="fw-bold mb-4">Manage Platform Users</h4>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Blocked</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.usersList.map((usr) => (
                    <tr key={usr._id}>
                      <td>
                        <img 
                          src={usr.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                          alt="" 
                          className="rounded-circle"
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                        />
                      </td>
                      <td>{usr.name}</td>
                      <td>{usr.email}</td>
                      <td>
                        <span className="badge bg-secondary">{usr.role}</span>
                      </td>
                      <td>
                        <span className={`badge ${usr.blocked ? 'bg-danger' : 'bg-success'}`}>
                          {usr.blocked ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleToggleBlock(usr._id)}
                            disabled={usr._id === user._id}
                            className={`btn btn-sm d-flex align-items-center gap-1 ${usr.blocked ? 'btn-success' : 'btn-warning'}`}
                          >
                            <Ban size={14} />
                            {usr.blocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr._id)}
                            disabled={usr._id === user._id}
                            className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'hotels' && (
          <div>
            <h4 className="fw-bold mb-4">Manage Platform Properties</h4>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Hotel Name</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Host</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.listingsList.map((lst) => (
                    <tr key={lst._id}>
                      <td className="fw-bold">{lst.title}</td>
                      <td>{lst.location}, {lst.country}</td>
                      <td>${lst.price} / night</td>
                      <td>{lst.host?.name || 'Anonymous'}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteListing(lst._id)}
                          className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove Listing
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h4 className="fw-bold mb-4">Manage Reviews</h4>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Property</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.reviewsList.map((rev) => (
                    <tr key={rev._id}>
                      <td>{rev.user?.name || 'Anonymous'}</td>
                      <td>{rev.listing?.title || 'Unknown Property'}</td>
                      <td>
                        <span className="badge bg-warning text-dark">{rev.rating} ★</span>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '300px' }}>{rev.comment}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
