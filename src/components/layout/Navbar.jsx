import { Link, useLocation } from 'react-router-dom';
import { Search, User, Flame, Sun, Moon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';
import useTheme from '../../store/useTheme';

const navLinks = [
  { to: '/', label: 'Book Tickets' },
  { to: '/list-event', label: 'List an Event' },
  { to: '/resell-tickets', label: 'Resell Tickets' },
  { to: '/my-bookings', label: 'My Bookings' },
  { to: '/admin', label: 'Admin Dashboard' },
];

export default function Navbar() {
  const location = useLocation();
  const { isLoggedIn, user, logout } = useStore();
  const { mode, toggle } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = mode === 'dark';

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
      style={{
        backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? '#222' : '#e5e5e5',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline group">
          <Flame className="w-7 h-7" style={{ color: '#7DA8CF' }} />
          <span
            className="font-heading font-bold text-xl tracking-tight"
            style={{ color: isDark ? '#fff' : '#111' }}
          >
            CookMyShow
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-4 py-2 text-[13px] font-medium no-underline transition-colors duration-300 uppercase tracking-wider"
                style={{
                  color: isActive ? '#7DA8CF' : isDark ? '#999' : '#666',
                }}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-4 right-4 h-[2px]"
                    style={{ background: '#7DA8CF' }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border"
            style={{
              background: isDark ? '#141414' : '#f5f5f5',
              borderColor: isDark ? '#333' : '#ddd',
              color: isDark ? '#7DA8CF' : '#666',
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Search */}
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent"
            style={{ color: isDark ? '#999' : '#666' }}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Profile */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none"
                style={{ color: isDark ? '#ccc' : '#444' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center border"
                  style={{
                    background: isDark ? '#141414' : '#f5f5f5',
                    borderColor: isDark ? '#333' : '#ddd',
                  }}
                >
                  <User className="w-4 h-4" />
                </div>
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-2xl py-2 z-50 border"
                    style={{
                      background: isDark ? '#0a0a0a' : '#fff',
                      borderColor: isDark ? '#222' : '#e5e5e5',
                    }}
                  >
                    <div className="px-4 py-2 border-b" style={{ borderColor: isDark ? '#222' : '#eee' }}>
                      <p className="text-sm font-medium" style={{ color: isDark ? '#fff' : '#111' }}>{user?.name || 'User'}</p>
                      <p className="text-xs" style={{ color: isDark ? '#666' : '#999' }}>{user?.email || 'user@email.com'}</p>
                    </div>
                    <Link to="/my-bookings" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-sm no-underline hover:opacity-80" style={{ color: isDark ? '#ccc' : '#333' }}>
                      My Bookings
                    </Link>
                    <button
                      onClick={() => { logout(); setShowProfile(false); }}
                      className="w-full text-left px-4 py-2 text-sm cursor-pointer bg-transparent border-none"
                      style={{ color: '#EF4444' }}
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="btn-outline text-xs py-2 px-4 no-underline hidden sm:inline-flex"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden cursor-pointer bg-transparent border-none"
            style={{ color: isDark ? '#ccc' : '#444' }}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t"
            style={{
              background: isDark ? '#000' : '#fff',
              borderColor: isDark ? '#222' : '#e5e5e5',
            }}
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-sm font-medium no-underline uppercase tracking-wider"
                  style={{
                    color: location.pathname === link.to ? '#7DA8CF' : isDark ? '#999' : '#666',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
