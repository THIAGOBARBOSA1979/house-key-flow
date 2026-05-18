import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/i18n'
import App from './App.tsx'
import './index.css'

import { SyncService } from './services'
import { ErrorBoundary } from './components/Shared/ErrorBoundary.tsx'

// Initialize the SyncService with error handling
try {
  SyncService.initialize();
} catch (error) {
  console.error('Erro ao inicializar SyncService:', error);
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
