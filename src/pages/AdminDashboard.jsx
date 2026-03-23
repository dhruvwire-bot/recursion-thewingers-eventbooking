import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { adminStats } from '../data/events';
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

const summaryCards = [
  { label: 'Tickets Sold', value: adminStats.ticketsSold, dotColor: '#4ADE80', prefix: '' },
  { label: 'Unsold', value: adminStats.unsold, dotColor: '#3B82F6', prefix: '' },
  { label: 'Cancelled', value: adminStats.cancelled, dotColor: '#EF4444', prefix: '' },
  { label: 'Revenue', value: Math.round(adminStats.revenue / 1000), dotColor: '#7DA8CF', prefix: '₹', suffix: 'K' },
];

export default function AdminDashboard() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const tooltipStyle = {
    background: isDark ? '#0a0a0a' : '#fff',
    border: `1px solid ${isDark ? '#1a1a1a' : '#eee'}`,
    borderRadius: '8px',
    color: isDark ? '#fff' : '#111',
    fontSize: '13px',
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: '#7DA8CF' }}>
          Analytics
        </p>
        <h2
          className="text-4xl md:text-5xl font-bold font-heading"
          style={{ color: isDark ? '#fff' : '#111', letterSpacing: '-0.02em' }}
        >
          Admin Dashboard
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-lg border p-5"
            style={{ borderColor: isDark ? '#1a1a1a' : '#eee', background: isDark ? '#0a0a0a' : '#fafafa' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: card.dotColor }} />
              <span className="text-xs uppercase tracking-wider" style={{ color: isDark ? '#555' : '#999' }}>{card.label}</span>
            </div>
            <AnimatedNumber value={card.value} prefix={card.prefix} suffix={card.suffix || ''} isDark={isDark} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border p-6"
          style={{ borderColor: isDark ? '#1a1a1a' : '#eee', background: isDark ? '#0a0a0a' : '#fafafa' }}
        >
          <h3 className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: '#7DA8CF' }}>Sold vs Unsold</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adminStats.soldVsUnsold}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {adminStats.soldVsUnsold.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {adminStats.soldVsUnsold.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: item.fill }} />
                <span className="text-sm" style={{ color: isDark ? '#666' : '#999' }}>{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sales Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border p-6"
          style={{ borderColor: isDark ? '#1a1a1a' : '#eee', background: isDark ? '#0a0a0a' : '#fafafa' }}
        >
          <h3 className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: '#7DA8CF' }}>Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminStats.salesTrend}>
                <defs>
                  <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7DA8CF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7DA8CF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a1a1a' : '#eee'} />
                <XAxis dataKey="date" stroke={isDark ? '#444' : '#bbb'} fontSize={12} />
                <YAxis stroke={isDark ? '#444' : '#bbb'} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#7DA8CF"
                  strokeWidth={2}
                  fill="url(#accentGradient)"
                  dot={{ fill: '#7DA8CF', r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
