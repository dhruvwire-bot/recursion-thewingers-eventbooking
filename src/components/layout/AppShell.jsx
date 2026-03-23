import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';
import useTheme from '../../store/useTheme';

export default function AppShell() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{
        background: isDark ? '#000' : '#fff',
        color: isDark ? '#e5e5e5' : '#333',
      }}
    >
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#141414' : '#fff',
            color: isDark ? '#e5e5e5' : '#333',
            border: `1px solid ${isDark ? '#222' : '#e5e5e5'}`,
          },
          success: { iconTheme: { primary: '#7DA8CF', secondary: isDark ? '#000' : '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
