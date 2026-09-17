import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import { SlidersHorizontal, ArrowDownAZ, Star, MapPin, Eye, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const { API_URL } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Advanced Filters Drawer Toggle
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Filter States
  const [minPrice, setMinPrice] = useState(10);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('newest');

  // Amenities Filter Checklist
  const [amenities, setAmenities] = useState({
    wifi: false,
    pool: false,
    gym: false,
    parking: false,
    breakfast: false,
    kitchen: false,
    ac: false,
    tv: false,
    washer: false,
    petFriendly: false
  });

  // Recently Viewed States
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  // Load recently viewed on mount
  useEffect(() => {
    const saved = localStorage.getItem('staynest_recently_viewed');
    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  }, []);

  // Fetch listings when filters or search change
  useEffect(() => {
    fetchListings(1, false); // reset to page 1 on filter changes
  }, [category, search, minPrice, maxPrice, rating, amenities, sort]);

  const fetchListings = async (targetPage = 1, append = false) => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_URL}/listings?page=${targetPage}&limit=12&sort=${sort}`;
      
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (rating) url += `&rating=${rating}`;

      // Append selected amenities
      Object.keys(amenities).forEach((key) => {
        if (amenities[key]) {
          url += `&${key}=true`;
        }
      });

      const res = await fetch(url);
      const result = await res.json();

      if (result.success) {
        if (append) {
          setListings((prev) => [...prev, ...result.data]);
        } else {
          setListings(result.data);
        }
        setTotalPages(result.pages || 1);
        setTotalCount(result.total || result.data.length);
        setPage(targetPage);
      } else {
        setError(result.message || 'Failed to fetch properties');
      }
    } catch (err) {
      setError('Error connecting to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchListings(page + 1, true);
    }
  };

  const handleAmenityChange = (key) => {
    setAmenities((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleResetFilters = () => {
    setMinPrice(10);
    setMaxPrice(1000);
    setRating('');
    setSort('newest');
    setAmenities({
      wifi: false,
      pool: false,
      gym: false,
      parking: false,
      breakfast: false,
      kitchen: false,
      ac: false,
      tv: false,
      washer: false,
      petFriendly: false
    });
    setSearchParams({});
  };

  return (
    <div className="container py-4 text-white">
      {/* Categories Bar */}
      <FilterBar />

      {/* Control Strip (Filters Toggle + Sorting Selection) */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 gap-3 bg-dark-card border border-secondary p-3 rounded-3">
        <div className="d-flex align-items-center gap-3">
          <button 
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 py-2 px-3"
          >
            <SlidersHorizontal size={16} />
            Filters & Price
          </button>
          
          <div className="small text-white-50">
            Showing {totalCount} stays matching criteria
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <ArrowDownAZ size={16} className="text-primary" />
          <select 
            className="form-select form-select-sm bg-dark border-secondary text-white" 
            style={{ width: '180px' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest Listed</option>
            <option value="price_asc">Lowest Price</option>
            <option value="price_desc">Highest Price</option>
            <option value="rating_desc">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Drawer Panel */}
      <AnimatePresence>
        {showFiltersDrawer && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card mt-3 p-4 overflow-hidden"
          >
            <div className="row g-4">
              {/* Price filter */}
              <div className="col-md-4">
                <h6 className="fw-bold mb-3 text-gradient-primary">Price Range per Night</h6>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between small text-white-50">
                    <span>Min: ${minPrice}</span>
                    <span>Max: ${maxPrice}</span>
                  </div>
                  <input 
                    type="range" 
                    className="form-range" 
                    min="10" 
                    max="1000" 
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Rating selection */}
              <div className="col-md-3">
                <h6 className="fw-bold mb-3 text-gradient-primary">Rating Scale</h6>
                <div className="d-flex flex-column gap-1">
                  {[
                    { value: '', label: 'All Ratings' },
                    { value: '4.7', label: '4.7★ Guests Favorite' },
                    { value: '4.5', label: '4.5★ Excellent' },
                    { value: '4.0', label: '4.0★ Very Good' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setRating(item.value)}
                      className={`btn btn-sm text-start py-1 px-2 border-0 text-white ${rating === item.value ? 'bg-primary' : 'hover-bg-dark'}`}
                      style={{ background: rating === item.value ? 'var(--primary-color)' : 'transparent' }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities checklist grid */}
              <div className="col-md-5">
                <h6 className="fw-bold mb-3 text-gradient-primary">Amenities & Facilities</h6>
                <div className="row row-cols-2 g-2">
                  {[
                    { key: 'wifi', label: 'Free WiFi' },
                    { key: 'pool', label: 'Swimming Pool' },
                    { key: 'gym', label: 'Fitness Gym' },
                    { key: 'parking', label: 'Free Parking' },
                    { key: 'breakfast', label: 'Breakfast Included' },
                    { key: 'kitchen', label: 'Kitchen' },
                    { key: 'ac', label: 'Air Conditioning' },
                    { key: 'tv', label: 'Smart TV' },
                    { key: 'washer', label: 'Washing Machine' },
                    { key: 'petFriendly', label: 'Pet Friendly' }
                  ].map((am) => (
                    <div key={am.key} className="col form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        id={`check-${am.key}`}
                        checked={amenities[am.key]}
                        onChange={() => handleAmenityChange(am.key)}
                      />
                      <label className="form-check-label small text-white-50" htmlFor={`check-${am.key}`}>
                        {am.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top border-secondary">
              <button onClick={handleResetFilters} className="btn btn-sm btn-outline-danger">Reset All</button>
              <button onClick={() => setShowFiltersDrawer(false)} className="btn btn-sm btn-primary">Apply Filters</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error notification */}
      {error && (
        <div className="alert alert-danger mt-4 bg-danger bg-opacity-10 border-danger text-danger">
          {error}
        </div>
      )}

      {/* Main Grid display area */}
      {loading && page === 1 ? (
        <div className="shimmer-grid mt-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="shimmer-card">
              <div className="shimmer-media"></div>
              <div className="shimmer-line w-80"></div>
              <div className="shimmer-line w-40"></div>
              <div className="shimmer-line w-60"></div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-5 my-5 glass-card">
          <h4 className="mb-2">No Properties Found</h4>
          <p className="text-white-50 small mb-4">We couldn't find any listings matching your active search filters.</p>
          <button onClick={handleResetFilters} className="btn btn-outline-primary">Clear All Filters</button>
        </div>
      ) : (
        <>
          <div className="listings-grid mt-4">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>

          {/* Load More Pagination */}
          {page < totalPages && (
            <div className="text-center mt-5">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className="btn btn-primary px-5 py-2 fw-bold"
              >
                {loading ? 'Loading More...' : 'Load More Stays'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Recently Viewed horizontal scroll section */}
      {recentlyViewed.length > 0 && (
        <div className="mt-5 pt-5 border-top border-secondary">
          <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <Eye size={24} className="text-primary animate-pulse" />
            Recently Viewed Stays
          </h4>
          <div className="d-flex gap-3 overflow-auto pb-3 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
            {recentlyViewed.map((lst) => (
              <Link 
                to={`/listings/${lst._id}`} 
                key={lst._id} 
                className="text-decoration-none"
                style={{ scrollSnapAlign: 'start', flex: '0 0 260px' }}
              >
                <div className="card bg-dark-card border-secondary text-white p-2 h-100 hover-lift">
                  <img 
                    src={lst.images?.[0] || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'} 
                    alt={lst.title} 
                    className="rounded mb-2"
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                  />
                  <h6 className="fw-bold mb-1 text-truncate">{lst.title}</h6>
                  <span className="small text-white-50 d-flex align-items-center gap-1">
                    <MapPin size={10} className="text-primary" />
                    {lst.location}
                  </span>
                  <div className="d-flex justify-content-between align-items-baseline mt-2 pt-1 border-top border-secondary">
                    <span className="fw-bold text-primary small">${lst.price}</span>
                    <span className="small text-warning d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                      <Star size={10} className="fill-warning" /> {lst.averageRating || '0'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
