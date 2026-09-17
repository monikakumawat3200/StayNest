import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Trips from './pages/Trips';
import ManageListings from './pages/ManageListings';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import CartPage from './pages/CartPage';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import StripeCheckout from './components/StripeCheckout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              {/* Top Navbar */}
              <Navbar />

              {/* Main Layout Area */}
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/listings/:id" element={<ListingDetail />} />
                  
                  {/* Protected User Profile & Interactions */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/checkout/:sessionId"
                    element={
                      <ProtectedRoute>
                        <StripeCheckout />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/owner-dashboard"
                    element={
                      <ProtectedRoute>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <Messages />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Booker Dashboard */}
                  <Route
                    path="/trips"
                    element={
                      <ProtectedRoute>
                        <Trips />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Protected Host Dashboard */}
                  <Route
                    path="/manage-listings"
                    element={
                      <ProtectedRoute>
                        <ManageListings />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Protected Host Forms */}
                  <Route
                    path="/create-listing"
                    element={
                      <ProtectedRoute>
                        <CreateListing />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/edit-listing/:id"
                    element={
                      <ProtectedRoute>
                        <EditListing />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
