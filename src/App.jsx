import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Analytics />
    </AuthProvider>
  );
}

export default App;

