import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Mail, Lock, User } from 'lucide-react';
import useStore from '../store/useStore';
import useTheme from '../store/useTheme';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useStore();
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name, email });
    toast.success('Account created!');
    navigate('/');
  };

  const inputStyle = {
    background: isDark ? '#0a0a0a' : '#fff',
    borderColor: isDark ? '#222' : '#e5e5e5',
    color: isDark ? '#fff' : '#333',
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Flame className="w-10 h-10 mx-auto mb-3" style={{ color: '#7DA8CF' }} />
          <h1 className="text-2xl font-bold font-heading" style={{ color: isDark ? '#fff' : '#111' }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: isDark ? '#666' : '#999' }}>Join CookMyShow</p>
        </div>

        <div className="rounded-lg border p-8" style={{ borderColor: isDark ? '#1a1a1a' : '#eee', background: isDark ? '#0a0a0a' : '#fafafa' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { icon: User, label: 'Full Name', type: 'text', value: name, set: setName, ph: 'John Doe' },
              { icon: Mail, label: 'Email', type: 'email', value: email, set: setEmail, ph: 'you@email.com' },
              { icon: Lock, label: 'Password', type: 'password', value: password, set: setPassword, ph: '••••••••' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#555' : '#aaa' }}>{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? '#444' : '#bbb' }} />
                  <input type={f.type} required value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                    className="w-full rounded border pl-10 pr-4 py-2.5 text-sm focus:outline-none" style={inputStyle} />
                </div>
              </div>
            ))}
            <button type="submit" className="w-full py-3 rounded font-bold text-sm uppercase tracking-wider border-none cursor-pointer" style={{ background: '#7DA8CF', color: '#000' }}>
              Create Account
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: isDark ? '#555' : '#aaa' }}>
            Have an account? <Link to="/auth/login" className="no-underline font-medium" style={{ color: '#7DA8CF' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
