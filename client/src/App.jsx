import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import AppRouter from './router/AppRouter';
import useAuthStore from './store/authStore';

function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const token = useAuthStore((state) => state.token);

  /**
   * On mount, if a token exists in localStorage re-fetch the user profile
   * so the user object is always populated after a page refresh.
   * If the token is expired the interceptor in api.js will attempt a refresh
   * using the HttpOnly cookie, then fetchMe clears state if that also fails.
   */
  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="poppins">
      <AppRouter />
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#7c3aed', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
}

export default App;
