import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Mail, Lock } from 'lucide-react';
import useStore from '../store/useStore';
import useTheme from '../store/useTheme';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useStore();
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name: email.split('@')[0], email });
    toast.success('Logged in!');
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
          <h1 className="text-2xl font-bold font-heading" style={{ color: isDark ? '#fff' : '#111' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: isDark ? '#666' : '#999' }}>Sign in to your account</p>
        </div>

        <div className="rounded-lg border p-8" style={{ borderColor: isDark ? '#1a1a1a' : '#eee', background: isDark ? '#0a0a0a' : '#fafafa' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#555' : '#aaa' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? '#444' : '#bbb' }} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                  className="w-full rounded border pl-10 pr-4 py-2.5 text-sm focus:outline-none" style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#555' : '#aaa' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? '#444' : '#bbb' }} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full rounded border pl-10 pr-4 py-2.5 text-sm focus:outline-none" style={inputStyle} />
              </div>
            </div>
            <button type="submit" className="w-full py-3 rounded font-bold text-sm uppercase tracking-wider border-none cursor-pointer" style={{ background: '#7DA8CF', color: '#000' }}>
              Sign In
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: `1px solid ${isDark ? '#1a1a1a' : '#eee'}` }} /></div>
            <div className="relative flex justify-center text-xs"><span style={{ background: isDark ? '#0a0a0a' : '#fafafa', color: isDark ? '#444' : '#bbb', padding: '0 12px' }}>or</span></div>
          </div>

          <button className="w-full rounded border py-2.5 text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors"
            style={{ background: 'transparent', borderColor: isDark ? '#222' : '#ddd', color: isDark ? '#ccc' : '#444' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>

          <p className="text-center text-sm mt-6" style={{ color: isDark ? '#555' : '#aaa' }}>
            No account? <Link to="/auth/signup" className="no-underline font-medium" style={{ color: '#7DA8CF' }}>Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
