import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;

