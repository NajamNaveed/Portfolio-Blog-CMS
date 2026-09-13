import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SiteContentProvider } from './context/SiteContentContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SiteContentProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1714',
                color: '#f6f2ea',
                border: '1px solid #2c2822',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#b6ff3c', secondary: '#12100f' } },
            }}
          />
        </SiteContentProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
