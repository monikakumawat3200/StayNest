import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Users, Home, Award, Star, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const OwnerDashboard = () => {
  const { token, API_URL, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentReviews: [],
    monthlyCharts: []
  });

  useEffect(() => {
    if (!user || user.role !== 'Owner') {
      showToast('Host account required to access owner dashboard', 'warning');
      navigate('/profile');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/dashboard/owner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setStats(result.data);
      } else {
        showToast('Failed to load dashboard data', 'error');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-white mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  // Find max value in monthly statistics to scale chart bars nicely
  const maxRevenue = Math.max(...stats.monthlyCharts.map(item => item.revenue || 1), 1000);

  return (
    <div className="container py-5 mt-4 text-white">
      <div className="d-flex align-items-center gap-3 mb-5">
        <LayoutDashboard className="text-primary" size={32} />
        <h2 className="mb-0 fw-bold text-gradient-primary">Owner Analytics Dashboard</h2>
      </div>

      {/* Stats Counter Row */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <motion.div whileHover={{ y: -5 }} className="glass-card p-4 text-center">
            <Home className="text-primary mb-3" size={32} />
            <h3 className="fw-bold mb-1">{stats.totalListings}</h3>
            <span className="text-white-50 small">Total Listings</span>
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div whileHover={{ y: -5 }} className="glass-card p-4 text-center">
            <Users className="text-info mb-3" size={32} />
            <h3 className="fw-bold mb-1">{stats.totalViews}</h3>
            <span className="text-white-50 small">Total Property Views</span>
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div whileHover={{ y: -5 }} className="glass-card p-4 text-center">
            <Award className="text-success mb-3" size={32} />
            <h3 className="fw-bold mb-1">{stats.totalBookings}</h3>
            <span className="text-white-50 small">Total Bookings</span>
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div whileHover={{ y: -5 }} className="glass-card p-4 text-center">
            <TrendingUp className="text-warning mb-3" size={32} />
            <h3 className="fw-bold mb-1">${stats.totalRevenue}</h3>
            <span className="text-white-50 small">Total Earnings (Revenue)</span>
          </motion.div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left column: earnings monthly charts */}
        <div className="col-lg-7">
          <div className="glass-card p-4 h-100">
            <h4 className="fw-bold mb-4">Monthly Earnings Analysis</h4>
            
            {/* Visual Glassmorphic Bar Chart */}
            <div className="d-flex align-items-end justify-content-between pt-5" style={{ height: '300px' }}>
              {stats.monthlyCharts.map((item, index) => {
                const heightPercentage = Math.max(10, Math.min(100, (item.revenue / maxRevenue) * 100));
                
                return (
                  <div key={index} className="d-flex flex-column align-items-center flex-grow-1" style={{ gap: '12px' }}>
                    {/* Hover revenue count */}
                    <span className="small text-primary fw-bold">${item.revenue}</span>
                    
                    {/* Animated chart bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercentage}px` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="w-50 rounded"
                      style={{
                        background: 'linear-gradient(180deg, var(--primary-color) 0%, rgba(0, 119, 182, 0.4) 100%)',
                        boxShadow: '0 0 15px rgba(0, 180, 216, 0.3)',
                        minHeight: '10px'
                      }}
                    />
                    
                    {/* Month Label */}
                    <span className="small text-white-50 text-center" style={{ fontSize: '11px' }}>
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: recent reviews left by guest */}
        <div className="col-lg-5">
          <div className="glass-card p-4 h-100">
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <MessageSquare className="text-primary" />
              Recent Guest Reviews
            </h4>
            
            {stats.recentReviews.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-white-50">No reviews received on your properties yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {stats.recentReviews.map((rev) => (
                  <div key={rev._id} className="p-3 rounded bg-dark-card border border-secondary">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                          alt={rev.user?.name} 
                          className="rounded-circle"
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                        />
                        <div>
                          <h6 className="mb-0 small fw-bold text-white">{rev.user?.name}</h6>
                          <span className="small text-white-50" style={{ fontSize: '10px' }}>on {rev.listing?.title}</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-1 text-warning small">
                        <Star size={12} className="fill-warning" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="card-text text-white-50 small mb-0">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
