import { Flame, Mail, Phone, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useTheme from '../../store/useTheme';

export default function Footer() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <footer
      className="border-t mt-auto transition-colors duration-300"
      style={{
        background: isDark ? '#000' : '#fafafa',
        borderColor: isDark ? '#1a1a1a' : '#e5e5e5',
      }}
    >
      {/* Newsletter strip */}
      <div
        className="border-b transition-colors"
        style={{ borderColor: isDark ? '#1a1a1a' : '#e5e5e5' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3
              className="text-xl font-bold font-heading mb-1"
              style={{ color: isDark ? '#fff' : '#111' }}
            >
              Stay in the loop
            </h3>
            <p className="text-sm" style={{ color: isDark ? '#666' : '#999' }}>
              Get notified about new events and exclusive offers.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 md:w-64 px-4 py-2.5 rounded text-sm border focus:outline-none transition-colors"
              style={{
                background: isDark ? '#0a0a0a' : '#fff',
                borderColor: isDark ? '#222' : '#ddd',
                color: isDark ? '#fff' : '#333',
              }}
            />
            <button className="btn-primary flex items-center gap-1 text-sm">
              Subscribe <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-6 h-6" style={{ color: '#7DA8CF' }} />
              <span
                className="font-heading font-bold text-lg"
                style={{ color: isDark ? '#fff' : '#111' }}
              >
                CookMyShow
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: isDark ? '#666' : '#999' }}>
              A smart ticketing platform with real-time seat booking,
              controlled resale, and automated waitlist management.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: isDark ? '#555' : '#aaa' }}
            >
              Contact
            </h4>
            <ul className="space-y-3 text-sm list-none p-0 m-0" style={{ color: isDark ? '#888' : '#666' }}>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" style={{ color: '#7DA8CF' }} /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" style={{ color: '#7DA8CF' }} /> hello@cookmyshow.com</li>
              <li className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" style={{ color: '#7DA8CF' }} /> cookmyshow.com</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: isDark ? '#555' : '#aaa' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm list-none p-0 m-0">
              {[
                { to: '/', label: 'Browse Events' },
                { to: '/list-event', label: 'List an Event' },
                { to: '/resell-tickets', label: 'Resale Market' },
                { to: '/my-bookings', label: 'My Bookings' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="no-underline transition-colors duration-300 hover:opacity-100"
                    style={{ color: isDark ? '#666' : '#888', }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: isDark ? '#555' : '#aaa' }}
            >
              Follow Us
            </h4>
            <div className="flex gap-3">
              {['Twitter', 'Instagram', 'LinkedIn'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 no-underline text-xs font-medium"
                  style={{
                    borderColor: isDark ? '#222' : '#ddd',
                    color: isDark ? '#666' : '#999',
                    background: 'transparent',
                  }}
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className="border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderColor: isDark ? '#1a1a1a' : '#e5e5e5' }}
        >
          <p className="text-xs" style={{ color: isDark ? '#444' : '#bbb' }}>
            &copy; 2026 CookMyShow. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: isDark ? '#333' : '#ccc' }}>
            Built with passion for live experiences.
          </p>
        </div>
      </div>
    </footer>
  );
}
