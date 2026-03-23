import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowLeft, TrendingUp, Users, Ticket, DollarSign, BarChart3 } from 'lucide-react';
import { sampleEvents } from '../data/events';
import useTheme from '../store/useTheme';

function AnimatedNumber({ value, prefix = '', suffix = '', isDark }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <span className="text-2xl md:text-3xl font-bold font-mono" style={{ color: isDark ? '#fff' : '#111' }}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

/* Generate fake analytics per event */
function getEventAnalytics(event) {
  const sold = Math.floor(event.totalSeats * (0.3 + Math.random() * 0.5));
  const resold = Math.floor(sold * 0.1);
  const cancelled = Math.floor(sold * 0.05);
  const revenue = sold * event.price;

  const tierBreakdown = event.tiers.map((t, i) => {
    const pct = i === 0 ? 45 : i === 1 ? 30 : i === 2 ? 20 : 5;
    return { name: t.name, value: pct, fill: ['#2DD4BF', '#F472B6', '#FBBF24', '#A78BFA'][i] || '#7DA8CF' };
  });

  const dailySales = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({
    date: d,
    bookings: Math.floor(20 + Math.random() * 80),
  }));

  return { sold, unsold: event.totalSeats - sold, resold, cancelled, revenue, tierBreakdown, dailySales };
}

function EventListItem({ event, isDark, isSelected, onClick }) {
  const analytics = getEventAnalytics(event);
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border cursor-pointer transition-all duration-200 flex items-center gap-4"
      style={{
        background: isSelected ? (isDark ? '#0f0f0f' : '#f5f5f5') : 'transparent',
        borderColor: isSelected ? '#7DA8CF' : (isDark ? '#1a1a1a' : '#eee'),
        boxShadow: isSelected ? '0 0 20px rgba(125,168,207,0.1)' : 'none',
      }}
    >
      <img
        src={event.image}
        alt=""
        className="w-14 h-14 rounded-lg object-cover shrink-0"
        style={{ filter: isDark ? 'brightness(0.7)' : 'none' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: isDark ? '#fff' : '#111' }}>{event.title}</p>
        <p className="text-xs" style={{ color: isDark ? '#555' : '#999' }}>{event.date}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-mono font-bold" style={{ color: '#7DA8CF' }}>
          {Math.round((analytics.sold / event.totalSeats) * 100)}%
        </p>
        <p className="text-[10px]" style={{ color: isDark ? '#444' : '#bbb' }}>sold</p>
      </div>
    </button>
  );
}

function EventAnalyticsView({ event, isDark }) {
  const analytics = getEventAnalytics(event);

  const tooltipStyle = {
    background: isDark ? '#0a0a0a' : '#fff',
    border: `1px solid ${isDark ? '#1a1a1a' : '#eee'}`,
    borderRadius: '8px',
    color: isDark ? '#fff' : '#111',
    fontSize: '13px',
  };

  const cards = [
    { label: 'Tickets Sold', value: analytics.sold, icon: Ticket, color: '#4ADE80' },
    { label: 'Unsold', value: analytics.unsold, icon: Users, color: '#3B82F6' },
    { label: 'Resold', value: analytics.resold, icon: TrendingUp, color: '#F59E0B' },
    { label: 'Revenue', value: Math.round(analytics.revenue / 1000), icon: DollarSign, color: '#7DA8CF', prefix: '₹', suffix: 'K' },
  ];

  return (
    <div>
      {/* Event header */}
      <div className="flex items-center gap-4 mb-8">
        <img src={event.image} alt="" className="w-16 h-16 rounded-lg object-cover" style={{ filter: isDark ? 'brightness(0.8)' : 'none' }} />
        <div>
          <h3 className="text-xl font-bold font-heading" style={{ color: isDark ? '#fff' : '#111' }}>{event.title}</h3>
          <p className="text-xs uppercase tracking-wider" style={{ color: isDark ? '#555' : '#999' }}>
            {event.date} &middot; {event.location} &middot; {event.totalSeats} capacity
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-lg border p-4"
            style={{ borderColor: isDark ? '#1a1a1a' : '#eee', background: isDark ? '#0a0a0a' : '#fafafa' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: isDark ? '#555' : '#999' }}>{card.label}</span>
            </div>
            <AnimatedNumber value={card.value} prefix={card.prefix || ''} suffix={card.suffix || ''} isDark={isDark} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier breakdown pie */}
        <div className="rounded-lg border p-5" style={{ borderColor: isDark ? '#1a1a1a' : '#eee', background: isDark ? '#0a0a0a' : '#fafafa' }}>
          <h4 className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: '#7DA8CF' }}>Ticket Type Breakdown</h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.tierBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                  {analytics.tierBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => `${val}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {analytics.tierBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.fill }} />
                <span className="text-[11px]" style={{ color: isDark ? '#666' : '#999' }}>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales trend */}
        <div className="rounded-lg border p-5" style={{ borderColor: isDark ? '#1a1a1a' : '#eee', background: isDark ? '#0a0a0a' : '#fafafa' }}>
          <h4 className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: '#7DA8CF' }}>Daily Sales</h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailySales}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7DA8CF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7DA8CF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a1a' : '#eee'} />
                <XAxis dataKey="date" stroke={isDark ? '#444' : '#bbb'} fontSize={11} />
                <YAxis stroke={isDark ? '#444' : '#bbb'} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="bookings" stroke="#7DA8CF" strokeWidth={2} fill="url(#salesGrad)" dot={{ fill: '#7DA8CF', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Extra stats row */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[
          { label: 'Avg. Ticket Price', value: `₹${event.price}` },
          { label: 'Cancellation Rate', value: `${Math.round((analytics.cancelled / analytics.sold) * 100)}%` },
          { label: 'Resale Rate', value: `${Math.round((analytics.resold / analytics.sold) * 100)}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border p-4 text-center"
            style={{ borderColor: isDark ? '#1a1a1a' : '#eee', background: isDark ? '#0a0a0a' : '#fafafa' }}
          >
            <p className="text-lg font-bold font-mono" style={{ color: '#7DA8CF' }}>{stat.value}</p>
            <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: isDark ? '#555' : '#999' }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [selectedEvent, setSelectedEvent] = useState(sampleEvents[0]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: '#7DA8CF' }}>Analytics</p>
        <h2 className="text-4xl md:text-5xl font-bold font-heading" style={{ color: isDark ? '#fff' : '#111', letterSpacing: '-0.02em' }}>
          Admin Dashboard
        </h2>
        <p className="text-sm mt-2" style={{ color: isDark ? '#666' : '#999' }}>
          Select an event to view detailed analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        {/* Event list sidebar */}
        <div>
          <h3 className="text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2" style={{ color: '#7DA8CF' }}>
            <BarChart3 className="w-4 h-4" /> Your Events
          </h3>
          <div className="space-y-2">
            {sampleEvents.map((event) => (
              <EventListItem
                key={event.id}
                event={event}
                isDark={isDark}
                isSelected={selectedEvent?.id === event.id}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        </div>

        {/* Analytics panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedEvent?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedEvent && <EventAnalyticsView event={selectedEvent} isDark={isDark} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
