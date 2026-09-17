import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AMENITIES_LIST = [
  'Wifi',
  'Kitchen',
  'Private Pool',
  'Fireplace',
  'Air Conditioning',
  'Free Parking',
  'Hot Tub',
  'Gym Access',
  'Beach Access',
  'Ocean View',
];

const IMAGE_TEMPLATES = [
  { name: 'Cozy Alpine Cabin', path: '/images/cabin.jpg' },
  { name: 'Beachfront Sunset Villa', path: '/images/beach_villa.jpg' },
  { name: 'Penthouse Loft Skyline', path: '/images/loft.jpg' },
  { name: 'Jungle Treehouse Canopy', path: '/images/treehouse.jpg' },
  { name: 'Cliffside Mediterranean Estate', path: '/images/mansion.jpg' },
];

const EditListing = () => {
  const { id } = useParams();
  const { token, user, API_URL } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cabin');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState('/images/cabin.jpg');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchListing();
  }, [id, token]);

  const fetchListing = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/listings/${id}`);
      const result = await res.json();

      if (result.success) {
        const listing = result.data;
        // Verify owner
        if ((listing.host?._id || listing.host) !== user?._id) {
          navigate('/manage-listings');
          return;
        }

        setTitle(listing.title);
        setCategory(listing.category);
        setPrice(listing.price);
        setLocation(listing.location);
        setCountry(listing.country);
        setDescription(listing.description);
        setSelectedImage(listing.images?.[0] || '/images/cabin.jpg');
        setFacilities(listing.facilities || []);
      } else {
        setError(result.message || 'Failed to fetch property details.');
      }
    } catch (err) {
      setError('Connection failed fetching details.');
    } finally {
      setFetching(false);
    }
  };

  const handleCheckboxChange = (amenity) => {
    setFacilities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (!title || !price || !location || !country || !description) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category,
          price: Number(price),
          location,
          country,
          description,
          images: [selectedImage],
          facilities,
        }),
      });

      const result = await res.json();

      if (result.success) {
        navigate('/manage-listings');
      } else {
        setError(result.message || 'Failed to update listing');
      }
    } catch (err) {
      setError('Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Loading listing details...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px', maxWidth: '720px' }}>
      <Link to="/manage-listings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--dark)', marginBottom: '24px' }}>
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', fill: 'none', height: '12px', width: '12px', stroke: 'currentColor', strokeWidth: '4px', overflow: 'visible' }}>
          <path d="M20 28 8 16 20 4"></path>
        </svg>
        Back to listings
      </Link>

      <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 600 }}>Edit property listing</h1>
      <p style={{ color: 'var(--gray)', marginBottom: '32px' }}>Update details for your hosted property on StayNest.</p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="form-group">
          <label htmlFor="title">Property Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Stunning Glass Treehouse in Ubud"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Cabin">Cabin</option>
              <option value="Beachfront">Beachfront</option>
              <option value="Mansion">Mansion</option>
              <option value="Treehouse">Treehouse</option>
              <option value="Countryside">Countryside</option>
              <option value="Desert">Desert</option>
              <option value="Urban">Urban</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Nightly Price ($)</label>
            <input
              type="number"
              id="price"
              min="10"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 150"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">City / Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Malibu, California"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="imageStyle">Property Image Style (Premium Generated templates)</label>
          <select
            id="imageStyle"
            value={selectedImage}
            onChange={(e) => setSelectedImage(e.target.value)}
          >
            {IMAGE_TEMPLATES.map((tpl) => (
              <option key={tpl.path} value={tpl.path}>
                {tpl.name}
              </option>
            ))}
          </select>
          <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', height: '200px', backgroundColor: '#eee' }}>
            <img
              src={selectedImage}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell guests about your space..."
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label style={{ marginBottom: '12px' }}>Amenities Offered</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {AMENITIES_LIST.map((amenity) => (
              <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={facilities.includes(amenity)}
                  onChange={() => handleCheckboxChange(amenity)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="widget-btn" disabled={loading} style={{ marginTop: '24px' }}>
          {loading ? 'Saving changes...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default EditListing;
