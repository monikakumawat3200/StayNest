import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Calendar, Home, MessageSquare, Edit3, Lock, LogOut, Plus, Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, token, logout, reloadUser, API_URL } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profileStats, setProfileStats] = useState({
    totalListings: 0,
    totalReviews: 0,
    joinedDate: ''
  });
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Edit Profile States
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [role, setRole] = useState(user?.role || 'Customer');

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    setName(user.name);
    setEmail(user.email);
    setAvatar(user.avatar || '');
    setRole(user.role || 'Customer');
    
    fetchProfileStats();
    fetchMyListings();
  }, [user]);

  const fetchProfileStats = async () => {
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setProfileStats({
          totalListings: result.data.totalListings,
          totalReviews: result.data.totalReviews,
          joinedDate: new Date(result.data.joinedDate).toLocaleDateString('default', {
            month: 'long',
            year: 'numeric'
          })
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchMyListings = async () => {
    try {
      setLoadingListings(true);
      const res = await fetch(`${API_URL}/listings?host=${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setMyListings(result.data);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, avatar, role })
      });
      const result = await res.json();
      if (result.success) {
        showToast('Profile updated successfully!', 'success');
        setEditMode(false);
        reloadUser();
      } else {
        showToast(result.message || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Server error. Failed to update profile.', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const result = await res.json();
      if (result.success) {
        showToast('Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        showToast(result.message || 'Password update failed', 'error');
      }
    } catch (err) {
      showToast('Server error.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`${API_URL}/listings/${listingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        showToast('Listing deleted successfully!', 'success');
        fetchMyListings();
        fetchProfileStats();
      } else {
        showToast(result.message || 'Failed to delete listing', 'error');
      }
    } catch (err) {
      showToast('Server error.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  return (
    <div className="container py-5 mt-4">
      <div className="row g-4">
        {/* Left Side: Profile Info Card */}
        <div className="col-lg-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 text-center text-white"
          >
            <div className="position-relative d-inline-block mb-3">
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                alt={user?.name} 
                className="rounded-circle border border-3 border-primary shadow"
                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
              />
              <span className={`position-absolute bottom-0 end-0 badge rounded-pill bg-primary px-3 py-2`}>
                {user?.role || 'Customer'}
              </span>
            </div>
            
            <h3 className="mb-1 text-gradient-primary">{user?.name}</h3>
            <p className="text-white-50 mb-3">{user?.email}</p>

            <div className="d-flex justify-content-center align-items-center gap-2 text-white-50 mb-4">
              <Calendar size={16} />
              <span>Joined {profileStats.joinedDate || 'Loading...'}</span>
            </div>

            <hr className="border-secondary mb-4" />

            {/* Profile Statistics Grid */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="p-3 rounded bg-dark-card border border-secondary">
                  <Home className="text-primary mb-2" size={24} />
                  <h4 className="mb-0 fw-bold">{profileStats.totalListings}</h4>
                  <small className="text-white-50">Listings</small>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded bg-dark-card border border-secondary">
                  <MessageSquare className="text-success mb-2" size={24} />
                  <h4 className="mb-0 fw-bold">{profileStats.totalReviews}</h4>
                  <small className="text-white-50">Reviews</small>
                </div>
              </div>
            </div>

            {/* Sidebar action buttons */}
            <div className="d-flex flex-column gap-2">
              <button 
                onClick={() => setEditMode(true)}
                className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: My Listings & Change Password */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            
            {/* Edit Profile Modal/State Form */}
            {editMode && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 text-white"
              >
                <h4 className="mb-4 d-flex align-items-center gap-2">
                  <Edit3 className="text-primary" />
                  Edit Profile Info
                </h4>
                <form onSubmit={handleUpdateProfile}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-white-50">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark border-secondary text-white" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control bg-dark border-secondary text-white" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50">Profile Picture URL</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark border-secondary text-white" 
                        value={avatar} 
                        onChange={(e) => setAvatar(e.target.value)} 
                        placeholder="Link to online image avatar"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50">Account Role Type</label>
                      <select 
                        className="form-select bg-dark border-secondary text-white" 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="Customer">Customer (Book hotels)</option>
                        <option value="Owner">Owner (Host / Publish properties)</option>
                      </select>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary px-4">Save Changes</button>
                    <button 
                      type="button" 
                      onClick={() => setEditMode(false)}
                      className="btn btn-secondary px-4"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* My Hotel Listings Section */}
            <div className="glass-card p-4 text-white">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">My Hotel Listings</h4>
                {user?.role === 'Owner' && (
                  <Link to="/create-listing" className="btn btn-primary d-flex align-items-center gap-2">
                    <Plus size={18} />
                    Add New Listing
                  </Link>
                )}
              </div>

              {loadingListings ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : myListings.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-secondary rounded">
                  <p className="text-white-50 mb-3">You haven't added any property yet.</p>
                  {user?.role === 'Owner' ? (
                    <Link to="/create-listing" className="btn btn-primary btn-sm">
                      Create Your First Listing
                    </Link>
                  ) : (
                    <p className="text-info small mb-0">Switch your profile role to "Owner" above to start hosting listings!</p>
                  )}
                </div>
              ) : (
                <div className="row g-3">
                  {myListings.map((listing) => (
                    <div key={listing._id} className="col-md-6 col-lg-12">
                      <div className="card bg-dark-card border-secondary text-white p-3 h-100 shadow-sm">
                        <div className="d-flex flex-column flex-lg-row gap-3">
                          <img 
                            src={listing.images[0] || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'} 
                            alt={listing.title} 
                            className="rounded"
                            style={{ width: '100%', height: '140px', objectFit: 'cover', maxWidth: '200px' }}
                          />
                          <div className="flex-grow-1 d-flex flex-column justify-content-between">
                            <div>
                              <h5 className="card-title fw-bold mb-1">{listing.title}</h5>
                              <p className="card-text text-white-50 mb-2 small d-flex align-items-center gap-1">
                                <MapPin size={14} className="text-primary" />
                                {listing.location}, {listing.country}
                              </p>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="badge bg-primary">${listing.price} / night</span>
                                <span className="small text-white-50 d-flex align-items-center gap-1">
                                  <Star size={14} className="text-warning fill-warning" />
                                  {listing.averageRating || '0'} ({listing.reviewCount || 0} reviews)
                                </span>
                              </div>
                            </div>
                            <div className="d-flex gap-2 mt-2">
                              <Link to={`/listings/${listing._id}`} className="btn btn-sm btn-outline-info">View</Link>
                              <Link to={`/edit-listing/${listing._id}`} className="btn btn-sm btn-outline-warning">Edit</Link>
                              <button 
                                onClick={() => handleDeleteListing(listing._id)} 
                                className="btn btn-sm btn-outline-danger"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change Password Form */}
            <div className="glass-card p-4 text-white">
              <h4 className="mb-4 d-flex align-items-center gap-2">
                <Lock className="text-primary" />
                Change Password
              </h4>
              <form onSubmit={handleChangePassword}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-white-50">Current Password</label>
                    <input 
                      type="password" 
                      className="form-control bg-dark border-secondary text-white" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white-50">New Password</label>
                    <input 
                      type="password" 
                      className="form-control bg-dark border-secondary text-white" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={changingPassword}
                  className="btn btn-primary mt-4 px-4"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
