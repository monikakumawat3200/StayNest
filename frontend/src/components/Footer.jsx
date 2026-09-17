import React from 'react';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid #ebebeb', backgroundColor: 'var(--bg-gray)', padding: '40px 0', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '24px', fontSize: '14px', color: 'var(--gray)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--primary)' }}>StayNest</div>
        </div>
        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
          <div>
            <h5 style={{ color: 'var(--dark)', marginBottom: '12px', fontWeight: 600 }}>Explore</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="/" style={{ hover: { color: 'var(--dark)' } }}>Home</a></li>
              <li><a href="/?category=Cabin">Cabins</a></li>
              <li><a href="/?category=Beachfront">Beachfront</a></li>
            </ul>
          </div>
          <div>
            <h5 style={{ color: 'var(--dark)', marginBottom: '12px', fontWeight: 600 }}>Hosting</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="/manage-listings">Host Dashboard</a></li>
              <li><a href="/manage-listings">Create Listing</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
