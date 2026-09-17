import React from 'react';
import { useNavigate } from 'react-router-dom';

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();

  // Mock star rating based on ID length to make it look realistic
  const mockRating = (4.5 + (listing._id.charCodeAt(listing._id.length - 1) % 5) * 0.1).toFixed(1);

  return (
    <div className="listing-card" onClick={() => navigate(`/listings/${listing._id}`)}>
      <div className="listing-image-container">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="listing-image"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const fallbacks = {
              Cabin: '/images/cabin.jpg',
              Beachfront: '/images/beach_villa.jpg',
              Mansion: '/images/mansion.jpg',
              Treehouse: '/images/treehouse.jpg',
              Countryside: '/images/cabin.jpg',
              Desert: '/images/cabin.jpg',
              Urban: '/images/loft.jpg',
            };
            e.target.src = fallbacks[listing.category] || '/images/cabin.jpg';
          }}
        />
      </div>
      <div className="listing-card-info">
        <div className="listing-card-header">
          <h4 className="listing-card-title">{listing.title}</h4>
          <div className="listing-card-rating">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', fill: 'var(--primary)', height: '14px', width: '14px' }}>
              <path d="M16 1.333l4.9 9.9 10.9 1.6-7.9 7.7 1.9 10.9-9.8-5.1-9.8 5.1 1.9-10.9-7.9-7.7 10.9-1.6z"></path>
            </svg>
            <span>{mockRating}</span>
          </div>
        </div>
        <p className="listing-card-location">{listing.location}, {listing.country}</p>
        <span className="listing-card-category">{listing.category}</span>
        <div className="listing-card-price">
          <span>${listing.price}</span> night
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
