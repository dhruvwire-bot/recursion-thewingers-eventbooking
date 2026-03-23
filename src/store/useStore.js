import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Auth
  user: null,
  isLoggedIn: false,
  login: (userData) => set({ user: userData, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),

  // Seat selection
  selectedSeats: [],
  selectedTier: null,
  selectSeat: (seatIndex) => {
    const { selectedSeats } = get();
    if (selectedSeats.includes(seatIndex)) {
      set({ selectedSeats: selectedSeats.filter((s) => s !== seatIndex) });
    } else {
      set({ selectedSeats: [...selectedSeats, seatIndex] });
    }
  },
  clearSeats: () => set({ selectedSeats: [], selectedTier: null }),
  setSelectedTier: (tier) => set({ selectedTier: tier }),

  // Seat states for an event (map of seatIndex -> status)
  seatStates: {},
  initializeSeats: (totalSeats) => {
    const states = {};
    for (let i = 0; i < totalSeats; i++) {
      // Randomly mark some as booked/held for demo
      const rand = Math.random();
      if (rand < 0.15) states[i] = 'booked';
      else if (rand < 0.2) states[i] = 'held';
      else states[i] = 'available';
    }
    set({ seatStates: states, selectedSeats: [] });
  },

  // Cart
  cartTotal: 0,
  setCartTotal: (total) => set({ cartTotal: total }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

export default useStore;
