import { useState, useMemo } from 'react';
import { Search, ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import EventCard from '../components/home/EventCard';
import { sampleEvents } from '../data/events';
import useTheme from '../store/useTheme';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return sampleEvents;
    const q = searchQuery.toLowerCase();
    return sampleEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div>
      {/* Hero — bridgeworx inspired: minimal, bold typography */}
      <section className="relative overflow-hidden" style={{ minHeight: '60vh' }}>
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&h=900&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(60%) brightness(0.3)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.95))'
                : 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.95))',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col justify-end" style={{ minHeight: '60vh', paddingBottom: '80px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="font-heading font-bold leading-none mb-4"
              style={{
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                color: isDark ? '#fff' : '#111',
                letterSpacing: '-0.03em',
              }}
            >
              Live events,<br />
              <span style={{ color: '#7DA8CF' }}>reimagined.</span>
            </h1>
            <p
              className="text-lg max-w-lg mb-8 leading-relaxed"
              style={{ color: isDark ? '#888' : '#666' }}
            >
              Real-time seat booking. Controlled resale. Smart waitlists.
              No double bookings, ever.
            </p>
            <div className="flex gap-3">
              <a href="#events" className="btn-primary no-underline flex items-center gap-2">
                Browse Events <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#about" className="btn-outline no-underline flex items-center gap-2">
                <Calendar className="w-4 h-4" /> View Calendar
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="max-w-7xl mx-auto px-6 py-20">
        {/* Section header — bridgeworx style */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <p
              className="text-xs uppercase tracking-widest font-bold mb-2"
              style={{ color: '#7DA8CF' }}
            >
              What&apos;s On
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold font-heading"
              style={{ color: isDark ? '#fff' : '#111', letterSpacing: '-0.02em' }}
            >
              Upcoming Events
            </h2>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? '#555' : '#aaa' }} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={{
                background: isDark ? '#0a0a0a' : '#fafafa',
                borderColor: isDark ? '#222' : '#e5e5e5',
                color: isDark ? '#fff' : '#333',
              }}
            />
          </div>
        </div>

        {/* Gallery Grid — 3 columns, bridgeworx style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <p style={{ color: isDark ? '#555' : '#aaa' }} className="text-lg">No events found</p>
            <button onClick={() => setSearchQuery('')} className="btn-outline text-sm mt-4">
              Clear search
            </button>
          </div>
        )}
      </section>

      {/* About / Features — bridgeworx inspired: minimal, elegant */}
      <section
        id="about"
        className="border-t transition-colors"
        style={{ borderColor: isDark ? '#1a1a1a' : '#eee' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                num: '01',
                title: 'Real-Time Booking',
                desc: 'Every seat syncs instantly across all users. Firebase transactions ensure zero double-bookings.',
              },
              {
                num: '02',
                title: 'Smart Resale',
                desc: 'Controlled marketplace with 2x price cap. Set your price, negotiate live, close deals instantly.',
              },
              {
                num: '03',
                title: 'Auto Waitlist',
                desc: 'FIFO queue with automatic seat reassignment. Get notified the moment a spot opens up.',
              },
            ].map((f, i) => (
              <motion.div
                key={f.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span
                  className="text-5xl font-bold font-heading block mb-4"
                  style={{ color: isDark ? '#1a1a1a' : '#f0f0f0' }}
                >
                  {f.num}
                </span>
                <h3
                  className="text-xl font-bold font-heading mb-2"
                  style={{ color: isDark ? '#fff' : '#111' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? '#666' : '#888' }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section
        className="border-t transition-colors"
        style={{
          borderColor: isDark ? '#1a1a1a' : '#eee',
          background: isDark ? '#0a0a0a' : '#fafafa',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '12K+', label: 'Tickets Sold' },
            { value: '500+', label: 'Events Hosted' },
            { value: 'Zero', label: 'Double Bookings' },
            { value: '98%', label: 'Satisfaction' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-bold font-mono" style={{ color: '#7DA8CF' }}>
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-widest mt-2" style={{ color: isDark ? '#555' : '#aaa' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
