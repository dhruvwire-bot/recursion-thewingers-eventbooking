import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, Trash2, Eye } from 'lucide-react';
import useTheme from '../store/useTheme';
import toast from 'react-hot-toast';

function SeatLayoutPreview({ count, isDark }) {
  const cols = Math.min(14, Math.ceil(Math.sqrt(count)));
  if (count <= 0) return null;

  return (
    <div className="rounded-lg p-4 border" style={{ background: isDark ? '#0a0a0a' : '#f5f5f5', borderColor: isDark ? '#1a1a1a' : '#eee' }}>
      <p className="text-xs mb-3" style={{ color: isDark ? '#555' : '#999' }}>
        Preview: {count} seats ({Math.ceil(count / cols)} rows × {cols} cols)
      </p>
      <div
        className="grid gap-1 justify-center mx-auto"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `${cols * 22}px` }}
      >
        {Array.from({ length: Math.min(count, 300) }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.002 }}
            className="w-4 h-4 rounded-full"
            style={{ background: '#4ADE80' }}
          />
        ))}
      </div>
      {count > 300 && (
        <p className="text-xs mt-2 text-center" style={{ color: isDark ? '#444' : '#bbb' }}>
          Showing first 300 of {count} seats
        </p>
      )}
    </div>
  );
}

export default function ListEvent() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    totalSeats: 100,
    image: null,
  });
  const [tiers, setTiers] = useState([
    { name: 'General', price: '' },
    { name: 'VIP', price: '' },
    { name: 'Premium', price: '' },
  ]);

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const addTier = () => setTiers([...tiers, { name: '', price: '' }]);
  const removeTier = (i) => setTiers(tiers.filter((_, idx) => idx !== i));
  const updateTier = (i, field, value) => setTiers(tiers.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Event listed successfully!');
  };

  const inputStyle = {
    background: isDark ? '#0a0a0a' : '#fff',
    borderColor: isDark ? '#222' : '#e5e5e5',
    color: isDark ? '#fff' : '#333',
  };

  const labelStyle = { color: isDark ? '#555' : '#aaa' };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: '#7DA8CF' }}>
          Create
        </p>
        <h2
          className="text-4xl md:text-5xl font-bold font-heading"
          style={{ color: isDark ? '#fff' : '#111', letterSpacing: '-0.02em' }}
        >
          List an Event
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
          {/* Left: Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={labelStyle}>Event Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Arijit Singh Live Concert"
                className="w-full rounded border px-4 py-2.5 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={labelStyle}>Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your event..."
                className="w-full rounded border px-4 py-2.5 text-sm focus:outline-none resize-none"
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5" style={labelStyle}>Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full rounded border px-4 py-2.5 text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5" style={labelStyle}>Time *</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => updateField('time', e.target.value)}
                  className="w-full rounded border px-4 py-2.5 text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={labelStyle}>Venue *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => updateField('venue', e.target.value)}
                placeholder="e.g., Mumbai Stadium"
                className="w-full rounded border px-4 py-2.5 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={labelStyle}>Cover Image</label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                style={{ borderColor: isDark ? '#222' : '#ddd' }}
              >
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: isDark ? '#444' : '#bbb' }} />
                <p className="text-sm" style={{ color: isDark ? '#555' : '#999' }}>Drag & drop or click to upload</p>
                <p className="text-xs mt-1" style={{ color: isDark ? '#444' : '#bbb' }}>PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={labelStyle}>Total Seats *</label>
              <input
                type="number"
                required
                min={10}
                max={1000}
                value={formData.totalSeats}
                onChange={(e) => updateField('totalSeats', Number(e.target.value))}
                className="w-full rounded border px-4 py-2.5 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Pricing Tiers */}
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2" style={labelStyle}>Pricing Tiers</label>
              <div className="space-y-3">
                {tiers.map((tier, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => updateTier(i, 'name', e.target.value)}
                      placeholder="Tier name"
                      className="flex-1 rounded border px-4 py-2 text-sm focus:outline-none"
                      style={inputStyle}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: isDark ? '#555' : '#999' }}>₹</span>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updateTier(i, 'price', e.target.value)}
                        placeholder="Price"
                        className="w-32 rounded border pl-7 pr-3 py-2 text-sm focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                    {tiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTier(i)}
                        className="bg-transparent border-none cursor-pointer transition-colors"
                        style={{ color: isDark ? '#555' : '#bbb' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#EF4444'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = isDark ? '#555' : '#bbb'; }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addTier}
                className="mt-3 text-xs uppercase tracking-wider flex items-center gap-1 bg-transparent border-none cursor-pointer font-bold"
                style={{ color: '#7DA8CF' }}
              >
                <Plus className="w-4 h-4" /> Add Tier
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded font-bold text-sm uppercase tracking-wider border-none cursor-pointer"
              style={{ background: '#7DA8CF', color: '#000' }}
            >
              List Event
            </button>
          </div>

          {/* Right: Seat Preview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: '#7DA8CF' }}>
              <Eye className="w-4 h-4" />
              Seat Layout Preview
            </h3>
            <SeatLayoutPreview count={formData.totalSeats} isDark={isDark} />
          </div>
        </div>
      </form>
    </div>
  );
}
