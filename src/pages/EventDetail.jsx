import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowLeft, Clock } from 'lucide-react';
import { sampleEvents } from '../data/events';
import useStore from '../store/useStore';
import useTheme from '../store/useTheme';

function SeatLegend({ isDark }) {
  const items = [
    { color: '#4ADE80', label: 'Available' },
    { color: '#F87171', label: 'Booked' },
    { color: '#FBBF24', label: 'Selected' },
    { color: isDark ? '#333' : '#ccc', label: 'Held' },
  ];
  return (
    <div className="flex flex-wrap gap-5 mt-5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
          <span className="text-xs" style={{ color: isDark ? '#666' : '#999' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function Seat({ index, status, isSelected, onSelect, isDark }) {
  const getColor = () => {
    if (isSelected) return '#FBBF24';
    switch (status) {
      case 'booked': return '#F87171';
      case 'held': return isDark ? '#333' : '#ccc';
      default: return '#4ADE80';
    }
  };
  const canSelect = status === 'available';

  return (
    <motion.button
      whileTap={canSelect ? { scale: 1.3 } : {}}
      onClick={() => canSelect && onSelect(index)}
      disabled={!canSelect && !isSelected}
      className="rounded-full border-none cursor-pointer transition-all duration-200"
      style={{
        width: 22, height: 22,
        background: getColor(),
        opacity: status === 'held' ? 0.5 : 1,
        cursor: canSelect || isSelected ? 'pointer' : 'not-allowed',
      }}
      title={`Row ${String.fromCharCode(65 + Math.floor(index / 14))}, Seat ${(index % 14) + 1}`}
    />
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = sampleEvents.find((e) => e.id === id);
  const { seatStates, initializeSeats, selectedSeats, selectSeat, selectedTier, setSelectedTier } = useStore();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  useEffect(() => {
    if (event) initializeSeats(event.totalSeats);
  }, [event?.id]);

  const cols = useMemo(() => {
    if (!event) return 14;
    return Math.min(14, Math.ceil(Math.sqrt(event.totalSeats)));
  }, [event]);

  const activeTier = selectedTier ? event?.tiers.find((t) => t.name === selectedTier) : event?.tiers[0];
  const totalPrice = (activeTier?.price || 0) * selectedSeats.length;

  const handleProceed = useCallback(() => {
    if (selectedSeats.length === 0) return;
    navigate('/checkout', {
      state: {
        event,
        seats: selectedSeats,
        tier: selectedTier || event.tiers[0].name,
        total: totalPrice || event.tiers[0].price * selectedSeats.length,
      },
    });
  }, [selectedSeats, selectedTier, totalPrice, event, navigate]);

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 style={{ color: isDark ? '#fff' : '#111' }}>Event not found</h2>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative" style={{ height: '50vh', minHeight: 350 }}>
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" style={{ filter: isDark ? 'brightness(0.4)' : 'brightness(0.7)' }} />
        <div className="absolute inset-0" style={{ background: isDark ? 'linear-gradient(to top, #000 10%, transparent 60%)' : 'linear-gradient(to top, #fff 10%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-10">
          <button onClick={() => navigate(-1)} className="link-more mb-4 text-sm bg-transparent border-none cursor-pointer flex items-center gap-1" style={{ color: '#7DA8CF' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-3" style={{ color: isDark ? '#fff' : '#111', letterSpacing: '-0.02em' }}>
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-5 text-sm" style={{ color: isDark ? '#888' : '#666' }}>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" style={{ color: '#7DA8CF' }} /> {event.date}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" style={{ color: '#7DA8CF' }} /> {event.location}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" style={{ color: '#7DA8CF' }} /> 7:00 PM onwards</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12">
          {/* Left */}
          <div>
            {/* Pricing Tiers */}
            <div className="mb-10">
              <h3 className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: '#7DA8CF' }}>Select Tier</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {event.tiers.map((tier) => {
                  const active = (selectedTier || event.tiers[0].name) === tier.name;
                  return (
                    <button
                      key={tier.name}
                      onClick={() => setSelectedTier(tier.name)}
                      className="rounded-lg p-4 text-center cursor-pointer border transition-all duration-300"
                      style={{
                        background: active ? (isDark ? '#0a0a0a' : '#f8f8f8') : 'transparent',
                        borderColor: active ? '#7DA8CF' : isDark ? '#222' : '#e5e5e5',
                        boxShadow: active ? '0 0 20px rgba(125,168,207,0.15)' : 'none',
                      }}
                    >
                      <p className="text-sm font-medium mb-1" style={{ color: isDark ? '#ccc' : '#444' }}>{tier.name}</p>
                      <p className="text-xl font-bold font-mono" style={{ color: isDark ? '#fff' : '#111' }}>₹{tier.price}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h3 className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: '#7DA8CF' }}>About This Event</h3>
              <p className="text-sm leading-7" style={{ color: isDark ? '#888' : '#555' }}>{event.description}</p>
              <p className="text-sm leading-7 mt-4" style={{ color: isDark ? '#888' : '#555' }}>
                The event features state-of-the-art sound systems, incredible lighting, and an electrifying atmosphere.
                Join thousands of fans for an unforgettable experience.
              </p>
            </div>

            {/* Venue Info */}
            <div
              className="rounded-lg p-6 border"
              style={{ background: isDark ? '#0a0a0a' : '#fafafa', borderColor: isDark ? '#1a1a1a' : '#eee' }}
            >
              <h3 className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: '#7DA8CF' }}>Venue</h3>
              <p className="font-semibold mb-1" style={{ color: isDark ? '#fff' : '#111' }}>{event.location}</p>
              <p className="text-sm" style={{ color: isDark ? '#666' : '#999' }}>
                <Users className="w-4 h-4 inline mr-1" style={{ color: '#7DA8CF' }} />
                Capacity: {event.totalSeats} seats
              </p>
            </div>
          </div>

          {/* Right — Seat Selection */}
          <div>
            <div
              className="rounded-lg border p-6 sticky top-20"
              style={{ background: isDark ? '#0a0a0a' : '#fafafa', borderColor: isDark ? '#1a1a1a' : '#eee' }}
            >
              <h3 className="text-xs uppercase tracking-widest font-bold mb-5" style={{ color: '#7DA8CF' }}>Select Seats</h3>

              {/* Stage */}
              <div
                className="rounded py-1.5 text-center text-xs uppercase tracking-widest mb-6"
                style={{ background: isDark ? '#1a1a1a' : '#e5e5e5', color: isDark ? '#555' : '#aaa' }}
              >
                Stage
              </div>

              {/* Seat Grid */}
              <div
                className="grid gap-1 justify-center mx-auto mb-4"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `${cols * 28}px` }}
              >
                {Object.entries(seatStates).map(([index, status]) => (
                  <Seat
                    key={index}
                    index={Number(index)}
                    status={status}
                    isSelected={selectedSeats.includes(Number(index))}
                    onSelect={selectSeat}
                    isDark={isDark}
                  />
                ))}
              </div>

              <SeatLegend isDark={isDark} />

              {/* Selection summary */}
              {selectedSeats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-5 pt-5 border-t"
                  style={{ borderColor: isDark ? '#1a1a1a' : '#eee' }}
                >
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: isDark ? '#888' : '#666' }}>
                      {activeTier?.name} × {selectedSeats.length}
                    </span>
                    <span className="font-mono font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Proceed */}
              <button
                onClick={handleProceed}
                disabled={selectedSeats.length === 0}
                className="w-full mt-5 py-3.5 rounded font-bold text-sm uppercase tracking-wider transition-all duration-300 border-none cursor-pointer"
                style={{
                  background: selectedSeats.length > 0 ? '#7DA8CF' : isDark ? '#1a1a1a' : '#e5e5e5',
                  color: selectedSeats.length > 0 ? '#000' : isDark ? '#555' : '#aaa',
                  cursor: selectedSeats.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                {selectedSeats.length > 0
                  ? `Proceed to Book — ₹${totalPrice.toLocaleString()}`
                  : 'Select seats to continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
