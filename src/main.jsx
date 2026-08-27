import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Global secure fetch interceptor to automatically inject JWT token
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const token = localStorage.getItem('family_pay_token');
  if (token && typeof url === 'string' && url.includes('/api/')) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  const response = await originalFetch(url, options);
  
  // If the server tells us the token is invalid or expired, force logout
  if (response.status === 401 || response.status === 403) {
    if (url.includes('/api/') && !url.includes('/api/auth/login')) {
      const userStr = localStorage.getItem('bait_finance_current_user');
      const wasLoggedIn = (userStr && userStr !== 'null') || localStorage.getItem('family_pay_token');
      
      localStorage.removeItem('family_pay_token');
      localStorage.removeItem('bait_finance_current_user');
      
      if (wasLoggedIn) {
        console.error('JWT Token expired or invalid! Forcing logout...');
        window.location.reload();
      }
    }
  }
  return response;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
