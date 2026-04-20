/**
 * main.jsx — Application entry point.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// Create the React root and render the component tree
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter enables <Route> and <Link> components throughout the app */}
    <BrowserRouter>
      {/* AuthProvider wraps everything so any component can access auth state via useAuth() */}
      <AuthProvider>
        {/* App contains the Navbar, Routes, and Footer */}
        <App />

        {/* Global toast notification system — styled to match the dark theme */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,  // Toasts auto-dismiss after 3 seconds
            style: {
              background: '#1a1a2e',                           // Dark background
              color: '#e0e0e0',                                // Light text
              border: '1px solid rgba(255,255,255,0.1)',       // Subtle border
              borderRadius: '12px',                            // Rounded corners
              fontFamily: 'Inter, sans-serif',                 // Matches app typography
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
