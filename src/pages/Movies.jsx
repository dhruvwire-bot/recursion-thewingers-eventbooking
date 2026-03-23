import { motion } from 'framer-motion';
import { Star, Clock, Play } from 'lucide-react';
import useTheme from '../store/useTheme';

const topMovies = [
  {
    id: 'm1',
    title: 'Pushpa 2: The Rule',
    language: 'Hindi',
    genre: 'Action/Drama',
    rating: 8.4,
    votes: '124K',
    duration: '2h 58m',
    certification: 'UA',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
  },
  {
    id: 'm2',
    title: 'Singham Again',
    language: 'Hindi',
    genre: 'Action/Thriller',
    rating: 7.2,
    votes: '89K',
    duration: '2h 24m',
    certification: 'UA',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop',
  },
  {
    id: 'm3',
    title: 'Stree 3',
    language: 'Hindi',
    genre: 'Horror/Comedy',
    rating: 8.1,
    votes: '156K',
    duration: '2h 12m',
    certification: 'UA',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop',
  },
  {
    id: 'm4',
    title: 'The Dark Knight Returns',
    language: 'English',
    genre: 'Action/Sci-Fi',
    rating: 9.1,
    votes: '210K',
    duration: '2h 45m',
    certification: 'UA',
    image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=450&fit=crop',
  },
  {
    id: 'm5',
    title: 'Jawan 2',
    language: 'Hindi',
    genre: 'Action/Drama',
    rating: 7.8,
    votes: '98K',
    duration: '2h 35m',
    certification: 'UA',
    image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=450&fit=crop',
  },
  {
    id: 'm6',
    title: 'Animal Park',
    language: 'Hindi',
    genre: 'Action/Crime',
    rating: 7.5,
    votes: '67K',
    duration: '3h 10m',
    certification: 'A',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop',
  },
];

function MovieCard({ movie, isDark, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer"
    >
      {/* Poster */}
      <div className="relative overflow-hidden rounded-xl mb-3" style={{ aspectRatio: '2/3' }}>
        <img
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover transition-all duration-700"
          style={{ filter: isDark ? 'grayscale(100%) brightness(0.8)' : 'grayscale(30%)' }}
          onMouseOver={(e) => { e.currentTarget.style.filter = 'grayscale(0%) brightness(1)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseOut={(e) => { e.currentTarget.style.filter = isDark ? 'grayscale(100%) brightness(0.8)' : 'grayscale(30%)'; e.currentTarget.style.transform = 'scale(1)'; }}
        />

        {/* Rating badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#4ADE80', backdropFilter: 'blur(4px)' }}
          >
            <Star className="w-3 h-3 fill-current" /> {movie.rating}
          </span>
        </div>

        {/* Certification badge */}
        <div className="absolute top-3 right-3">
          <span
            className="text-[9px] font-bold uppercase px-2 py-1 rounded-sm"
            style={{ background: movie.certification === 'A' ? '#EF4444' : '#7DA8CF', color: movie.certification === 'A' ? '#fff' : '#000' }}
          >
            {movie.certification}
          </span>
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
            <Play className="w-6 h-6 fill-white" style={{ color: '#fff' }} />
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: `linear-gradient(to top, ${isDark ? '#000' : '#fff'}, transparent)` }} />
      </div>

      {/* Info */}
      <h4 className="text-sm font-bold font-heading mb-1 truncate" style={{ color: isDark ? '#fff' : '#111' }}>
        {movie.title}
      </h4>
      <p className="text-xs mb-1" style={{ color: isDark ? '#555' : '#999' }}>
        {movie.genre}
      </p>
      <div className="flex items-center gap-2 text-xs" style={{ color: isDark ? '#444' : '#bbb' }}>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {movie.duration}</span>
        <span>&middot;</span>
        <span>{movie.language}</span>
      </div>
    </motion.div>
  );
}

export default function Movies() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: '#7DA8CF' }}>
          Now Showing
        </p>
        <h2
          className="text-4xl md:text-5xl font-bold font-heading"
          style={{ color: isDark ? '#fff' : '#111', letterSpacing: '-0.02em' }}
        >
          Book Movies
        </h2>
        <p className="text-sm mt-2 max-w-lg" style={{ color: isDark ? '#666' : '#999' }}>
          Explore the latest blockbusters and book your seats instantly.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['All', 'Hindi', 'English', 'Action', 'Comedy', 'Drama', 'Thriller'].map((f, i) => (
          <button
            key={f}
            className="text-xs uppercase tracking-wider px-4 py-2 rounded-full cursor-pointer transition-all border whitespace-nowrap"
            style={{
              background: i === 0 ? '#7DA8CF' : 'transparent',
              color: i === 0 ? '#000' : (isDark ? '#888' : '#666'),
              borderColor: i === 0 ? '#7DA8CF' : (isDark ? '#222' : '#ddd'),
              fontWeight: i === 0 ? 700 : 500,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Movie grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
        {topMovies.map((movie, i) => (
          <MovieCard key={movie.id} movie={movie} isDark={isDark} index={i} />
        ))}
      </div>
    </div>
  );
}
