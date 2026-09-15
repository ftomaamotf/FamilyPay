import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Global fetch interceptor
// يضيف مفتاح الجلسة تلقائياً إلى جميع طلبات API
const originalFetch = window.fetch;

window.fetch = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('family_pay_token');

    if (token && typeof url === 'string' && url.includes('/api/')) {
      options = {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`
        }
      };
    }

    const response = await originalFetch(url, options);

    // لا نعيد المستخدم إلى صفحة الدخول تلقائياً.
    // إذا حدث خطأ 401/403 نترك التطبيق يعالج الخطأ بدلاً من مسح الجلسة.
    if (
      (response.status === 401 || response.status === 403) &&
      typeof url === 'string' &&
      url.includes('/api/')
    ) {
      console.warn(
        'API authentication error:',
        response.status,
        url
      );
    }

    return response;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);