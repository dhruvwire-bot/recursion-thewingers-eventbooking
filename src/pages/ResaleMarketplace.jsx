import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Tag } from 'lucide-react';
import { sampleResaleTickets } from '../data/events';
import useTheme from '../store/useTheme';
import toast from 'react-hot-toast';

function ResaleTicketCard({ ticket }) {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [sliderValue, setSliderValue] = useState(ticket.resalePrice);
  const [status, setStatus] = useState('idle'); // idle | pending | accepted | rejected
  const minPrice = Math.round(ticket.originalPrice * 0.5);
  const maxPrice = ticket.originalPrice * 2;

  const handleQuote = () => {
    setStatus('pending');
    // Simulate seller response
    setTimeout(() => {
      if (sliderValue >= ticket.resalePrice * 0.95) {
        setStatus('accepted');
        toast.success(`Offer of ₹${sliderValue} accepted!`);
      } else {
        setStatus('rejected');
        toast.error('Offer rejected. Try a higher price.');
        setTimeout(() => setStatus('idle'), 2000);
      }
    }, 1500);
  };

  const handleBuy = () => {
    toast.success(`Purchased for ₹${sliderValue}!`);
  };

  const pricePercent = ((sliderValue - minPrice) / (maxPrice - minPrice)) * 100;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg aspect-[3/2] mb-4">
        <img
          src={ticket.image}
          alt={ticket.eventTitle}
          className="w-full h-full object-cover transition-all duration-700"
          style={{ filter: isDark ? 'grayscale(100%)' : 'grayscale(30%)' }}
          onMouseOver={(e) => { e.currentTarget.style.filter = 'grayscale(0%)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseOut={(e) => { e.currentTarget.style.filter = isDark ? 'grayscale(100%)' : 'grayscale(30%)'; e.currentTarget.style.transform = 'scale(1)'; }}
        />
        <div className="absolute top-3 right-3">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm flex items-center gap-1"
            style={{ background: '#4ADE80', color: '#000' }}
          >
            <Check className="w-3 h-3" /> 2x Cap
          </span>
        </div>
      </div>

      {/* Content */}
      <div>
        <h4
          className="text-lg font-bold font-heading mb-1"
          style={{ color: isDark ? '#fff' : '#111' }}
        >
          {ticket.eventTitle}
        </h4>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: isDark ? '#555' : '#999' }}>
          Seat {ticket.seat} &middot; {ticket.tier} &middot; Seller: {ticket.seller}
        </p>

        {/* Prices */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-sm line-through" style={{ color: isDark ? '#555' : '#bbb' }}>
            ₹{ticket.originalPrice}
          </span>
          <span className="text-2xl font-bold font-mono" style={{ color: '#7DA8CF' }}>
            ₹{sliderValue}
          </span>
        </div>

        {/* Price Slider */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2" style={{ color: isDark ? '#555' : '#aaa' }}>
            <span>₹{minPrice}</span>
            <span className="font-medium" style={{ color: '#7DA8CF' }}>Your offer</span>
            <span>₹{maxPrice}</span>
          </div>
          <div className="relative">
            <div
              className="w-full h-1.5 rounded-full"
              style={{ background: isDark ? '#1a1a1a' : '#e5e5e5' }}
            />
            <div
              className="absolute top-0 left-0 h-1.5 rounded-full transition-all duration-150"
              style={{ width: `${pricePercent}%`, background: '#7DA8CF' }}
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={10}
              value={sliderValue}
              onChange={(e) => { setSliderValue(Number(e.target.value)); setStatus('idle'); }}
              className="absolute top-0 left-0 w-full h-1.5 opacity-0 cursor-pointer"
              style={{ margin: 0 }}
            />
            {/* Thumb indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-150"
              style={{
                left: `calc(${pricePercent}% - 8px)`,
                background: isDark ? '#000' : '#fff',
                borderColor: '#7DA8CF',
                top: '3px',
              }}
            />
          </div>
          {/* Seller's price marker */}
          <div className="relative mt-1">
            <div
              className="absolute text-[10px] -translate-x-1/2"
              style={{
                left: `${((ticket.resalePrice - minPrice) / (maxPrice - minPrice)) * 100}%`,
                color: isDark ? '#555' : '#aaa',
              }}
            >
              ▲ Seller: ₹{ticket.resalePrice}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-8">
          <AnimatePresence mode="wait">
            {status === 'accepted' ? (
              <motion.button
                key="buy"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleBuy}
                className="flex-1 py-3 rounded font-bold text-sm uppercase tracking-wider border-none cursor-pointer flex items-center justify-center gap-2"
                style={{ background: '#4ADE80', color: '#000' }}
              >
                <Check className="w-4 h-4" /> Buy Now — ₹{sliderValue}
              </motion.button>
            ) : status === 'pending' ? (
              <motion.div
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 py-3 rounded text-center text-sm font-medium"
                style={{ background: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#888' : '#666' }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  Waiting for seller...
                </motion.span>
              </motion.div>
            ) : status === 'rejected' ? (
              <motion.div
                key="rejected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 py-3 rounded text-center text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
              >
                Rejected — try higher
              </motion.div>
            ) : (
              <motion.button
                key="quote"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleQuote}
                className="flex-1 py-3 rounded font-bold text-sm uppercase tracking-wider border-none cursor-pointer flex items-center justify-center gap-2 transition-all"
                style={{ background: '#7DA8CF', color: '#000' }}
              >
                <Tag className="w-4 h-4" /> Quote ₹{sliderValue}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResaleMarketplace() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: '#7DA8CF' }}>
          Marketplace
        </p>
        <h2
          className="text-4xl md:text-5xl font-bold font-heading"
          style={{ color: isDark ? '#fff' : '#111', letterSpacing: '-0.02em' }}
        >
          Resale Tickets
        </h2>
        <p className="text-sm mt-3 max-w-lg" style={{ color: isDark ? '#666' : '#999' }}>
          Browse available resale tickets. Use the slider to set your offer price — if the seller accepts, you can buy instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {sampleResaleTickets.map((ticket, i) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <ResaleTicketCard ticket={ticket} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
