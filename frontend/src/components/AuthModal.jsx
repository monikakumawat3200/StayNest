import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, error, setError } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [isOpen, isLoginMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let success = false;
    if (isLoginMode) {
      success = await login(email, password);
    } else {
      success = await register(name, email, password);
    }

    setLoading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentcolor', strokeWidth: '3px', overflow: 'visible' }} aria-hidden="true" role="presentation" focusable="false">
              <path d="m6 6 20 20M26 6 6 26"></path>
            </svg>
          </button>
          <h3>{isLoginMode ? 'Log in or sign up' : 'Create your account'}</h3>
        </div>
        <div className="modal-body">
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>
            Welcome to StayNest
          </h2>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <button type="submit" className="widget-btn" disabled={loading} style={{ marginTop: '16px' }}>
              {loading ? 'Processing...' : isLoginMode ? 'Continue' : 'Sign Up'}
            </button>
          </form>

          <div className="form-switch">
            <span>
              {isLoginMode
                ? "First time on StayNest?"
                : "Already have an account?"}
            </span>
            <button
              className="form-switch-btn"
              onClick={() => setIsLoginMode(!isLoginMode)}
            >
              {isLoginMode ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
