import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyBookings from './pages/MyBookings';
import ListEvent from './pages/ListEvent';
import ResaleMarketplace from './pages/ResaleMarketplace';
import Negotiation from './pages/Negotiation';
import Waitlist from './pages/Waitlist';
import AdminDashboard from './pages/AdminDashboard';
import useTheme from './store/useTheme';

export default function App() {
  const { mode } = useTheme();

  return (
    <div className={mode}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmation/:bookingId" element={<Confirmation />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/list-event" element={<ListEvent />} />
            <Route path="/resell-tickets" element={<ResaleMarketplace />} />
            <Route path="/negotiation/:ticketId" element={<Negotiation />} />
            <Route path="/waitlist/:eventId" element={<Waitlist />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
