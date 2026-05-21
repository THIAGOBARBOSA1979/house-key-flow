import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/i18n'
import App from './App.tsx'
import './index.css'

import { SyncService } from './services'
import { ErrorBoundary } from './components/shared/ErrorBoundary.tsx'

// Initialize the SyncService with error handling
try {
  // SyncService is optional based on environment
  if (import.meta.env.VITE_API_URL) {
    SyncService.initialize();
  }
} catch (error) {
  console.error('Failed to initialize optional services:', error);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
