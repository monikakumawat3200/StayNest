import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StripeCheckout = () => {
  const { token, API_URL } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  // Card Form Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvc, setCardCvc] = useState('•••');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    if (!bookingId) {
      showToast('Invalid payment session parameters', 'error');
      navigate('/');
      return;
    }
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/bookings/my-trips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        const found = result.data.find(b => b._id === bookingId);
        if (found) {
          setBooking(found);
        } else {
          showToast('Booking details not found', 'error');
          navigate('/');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!cardName) {
      showToast('Please enter cardholder name', 'warning');
      return;
    }

    setPaying(true);
    try {
      // Simulate Stripe loading processing latency
      await new Promise(r => setTimeout(r, 2000));

      const res = await fetch(`${API_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId, sessionId })
      });
      const result = await res.json();

      if (result.success) {
        showToast('Payment processed successfully!', 'success');
        setPaidSuccess(true);
      } else {
        showToast(result.message || 'Payment confirmation failed', 'error');
      }
    } catch (err) {
      showToast('Stripe payment processor server failure', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-white mt-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-5 mt-4 text-white">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <AnimatePresence mode="wait">
            {!paidSuccess ? (
              <motion.div 
                key="checkout-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-4"
              >
                <div className="d-flex align-items-center gap-2 mb-4">
                  <CreditCard className="text-primary" />
                  <h4 className="fw-bold mb-0">Secure Stripe Checkout</h4>
                </div>

                {/* Booking Brief Receipt */}
                <div className="p-3 rounded bg-dark-card border border-secondary mb-4 small text-white-50">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold text-white">{booking.listing?.title}</span>
                    <span className="text-white">${booking.listing?.price}/night</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Dates:</span>
                    <span>
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Guests:</span>
                    <span>{booking.guestsCount || 1} guest(s)</span>
                  </div>
                  <hr className="border-secondary" />
                  <div className="d-flex justify-content-between align-items-baseline">
                    <span className="text-white fw-bold">Total Price:</span>
                    <h4 className="mb-0 fw-bold text-primary">${booking.totalPrice}</h4>
                  </div>
                </div>

                {/* Credit Card inputs */}
                <form onSubmit={handlePay}>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Cardholder Name</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border-secondary text-white" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50 small">Card Number</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border-secondary text-white-50" 
                      value={cardNumber}
                      disabled
                    />
                  </div>
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <label className="form-label text-white-50 small">Expiration Date</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark border-secondary text-white-50" 
                        value={cardExpiry}
                        disabled
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-white-50 small">CVC / CVV</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark border-secondary text-white-50" 
                        value={cardCvc}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 mb-4 text-white-50 small">
                    <Lock size={14} className="text-success" />
                    <span>Transactions are fully encrypted & secured in test mode.</span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={paying}
                    className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  >
                    {paying ? (
                      <>
                        <div className="spinner-border spinner-border-sm text-white" role="status" />
                        Processing Securely...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Pay ${booking.totalPrice} Securely
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-5 text-center"
              >
                <CheckCircle2 className="text-success mx-auto mb-4" size={64} style={{ color: '#2ec4b6' }} />
                <h3 className="fw-bold mb-2">Booking Confirmed!</h3>
                <p className="text-white-50 mb-4">
                  We have verified your payment transaction. An email booking invoice confirmation has been sent to your registered account address.
                </p>

                {/* Receipt invoice print button */}
                <div className="d-flex flex-column gap-2">
                  <a
                    href={`${API_URL}/bookings/${bookingId}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-info w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  >
                    <Download size={16} />
                    Download Invoice PDF
                  </a>
                  <button 
                    onClick={() => navigate('/trips')}
                    className="btn btn-primary w-100 py-2"
                  >
                    Go to My Bookings
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;
