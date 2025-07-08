
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/Auth/ErrorBoundary';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <SupabaseAuthProvider>
      <App />
    </SupabaseAuthProvider>
  </ErrorBoundary>
);
