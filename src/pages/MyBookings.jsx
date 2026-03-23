import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X, ArrowRight } from 'lucide-react';
import { sampleBookings } from '../data/events';
import StatusBadge from '../components/shared/StatusBadge';
import useTheme from '../store/useTheme';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState(sampleBookings);
  const [tab, setTab] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const filtered = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab);

  const handleCancel = (id) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'failed' } : b)));
    setCancelModal(null);
    toast.success('Booking cancelled. Refund will be processed.');
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: '#7DA8CF' }}>
          Account
        </p>
        <h2
          className="text-4xl md:text-5xl font-bold font-heading"
          style={{ color: isDark ? '#fff' : '#111', letterSpacing: '-0.02em' }}
        >
          My Bookings
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'all', label: 'All' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
          { key: 'failed', label: 'Failed' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="text-xs uppercase tracking-wider px-5 py-2.5 rounded cursor-pointer transition-all border"
            style={{
              background: tab === t.key ? '#7DA8CF' : 'transparent',
              color: tab === t.key ? '#000' : (isDark ? '#888' : '#666'),
              borderColor: tab === t.key ? '#7DA8CF' : (isDark ? '#222' : '#ddd'),
              fontWeight: tab === t.key ? 700 : 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all"
              style={{
                borderColor: isDark ? '#1a1a1a' : '#eee',
                background: isDark ? '#0a0a0a' : '#fafafa',
              }}
            >
              {/* Thumbnail */}
              <img
                src={booking.image}
                alt=""
                className="w-16 h-16 rounded object-cover flex-shrink-0"
                style={{ filter: isDark ? 'brightness(0.8)' : 'none' }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold font-heading" style={{ color: isDark ? '#fff' : '#111' }}>
                  {booking.eventTitle}
                </h4>
                <p className="text-xs uppercase tracking-wider mt-1" style={{ color: isDark ? '#555' : '#999' }}>
                  {booking.date} &middot; {booking.location}
                </p>
                <p className="text-sm mt-1" style={{ color: isDark ? '#666' : '#888' }}>
                  {booking.seats.length} seat{booking.seats.length > 1 ? 's' : ''} &middot; {booking.tier} &middot;{' '}
                  <span className="font-mono font-semibold" style={{ color: '#7DA8CF' }}>₹{booking.total.toLocaleString()}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={booking.status} />

                {booking.status === 'upcoming' && (
                  <>
                    <button
                      onClick={() => setCancelModal(booking.id)}
                      className="text-xs uppercase tracking-wider py-2 px-4 rounded border-none cursor-pointer font-bold"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
                    >
                      Cancel
                    </button>
                    <button
                      className="text-xs uppercase tracking-wider py-2 px-4 rounded border-none cursor-pointer font-bold"
                      style={{ background: '#7DA8CF', color: '#000' }}
                    >
                      Resell
                    </button>
                  </>
                )}

                {booking.status === 'completed' && (
                  <button
                    className="text-xs uppercase tracking-wider py-2 px-4 rounded border-none cursor-pointer font-bold flex items-center gap-1"
                    style={{ background: '#7DA8CF', color: '#000' }}
                  >
                    <Ticket className="w-3 h-3" /> e-Ticket
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Ticket className="w-12 h-12 mx-auto mb-4" style={{ color: isDark ? '#333' : '#ccc' }} />
            <p style={{ color: isDark ? '#555' : '#999' }}>No bookings found</p>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="rounded-lg border p-6 max-w-md w-full"
              style={{ background: isDark ? '#0a0a0a' : '#fff', borderColor: isDark ? '#1a1a1a' : '#eee' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-heading" style={{ color: isDark ? '#fff' : '#111' }}>Cancel Booking</h3>
                <button onClick={() => setCancelModal(null)} className="bg-transparent border-none cursor-pointer" style={{ color: isDark ? '#555' : '#999' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm mb-3" style={{ color: isDark ? '#888' : '#666' }}>Are you sure you want to cancel this booking?</p>
              <div className="rounded-md p-4 mb-5" style={{ background: isDark ? '#111' : '#f5f5f5' }}>
                <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: isDark ? '#555' : '#999' }}>Refund Policy</p>
                <ul className="text-xs space-y-1 list-disc pl-4" style={{ color: isDark ? '#888' : '#666' }}>
                  <li>Full refund if cancelled 48+ hours before event</li>
                  <li>50% refund if cancelled 24-48 hours before</li>
                  <li>No refund within 24 hours of the event</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelModal(null)}
                  className="flex-1 py-2.5 rounded text-sm font-bold uppercase tracking-wider cursor-pointer border"
                  style={{ background: 'transparent', borderColor: isDark ? '#333' : '#ddd', color: isDark ? '#ccc' : '#444' }}
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => handleCancel(cancelModal)}
                  className="flex-1 py-2.5 rounded text-sm font-bold uppercase tracking-wider border-none cursor-pointer"
                  style={{ background: '#EF4444', color: '#fff' }}
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
