import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'font-black uppercase tracking-widest text-[10px] bg-charcoal-900 text-white rounded-2xl shadow-2xl border border-white/10',
              duration: 5000,
            }}
          />
          <AppRouter />
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;

