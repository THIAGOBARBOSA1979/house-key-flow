
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SyncService } from './services/SyncService.ts'

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
    <App />
  </StrictMode>
);
