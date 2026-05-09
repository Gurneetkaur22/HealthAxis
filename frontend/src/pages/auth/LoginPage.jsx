import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { role: 'Admin', email: 'admin@hospital.com', password: 'admin123', color: 'bg-purple-500' },
    { role: 'Doctor', email: 'dr.smith@hospital.com', password: 'doctor123', color: 'bg-blue-500' },
    { role: 'Receptionist', email: 'reception@hospital.com', password: 'reception123', color: 'bg-amber-500' },
    { role: 'Patient', email: 'john@email.com', password: 'patient123', color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-dark-900 text-white flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center font-bold text-xl">H</div>
            <div>
              <h1 className="text-2xl font-bold">HealthAxis</h1>
              <p className="text-sm text-primary-200">Smart Healthcare Management</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">Manage your hospital<br />with confidence</h2>
          <p className="text-primary-200 text-lg">A complete healthcare administration solution for modern hospitals.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {['Patient Records', 'Appointments', 'Billing', 'Analytics'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-primary-100">
                <div className="w-2 h-2 rounded-full bg-primary-300" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">H</div>
            <h1 className="text-xl font-bold text-dark-900">HealthAxis</h1>
          </div>

          <h2 className="text-2xl font-bold text-dark-900 mb-1">Welcome back</h2>
          <p className="text-dark-500 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" id="login-email" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" id="login-password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full" id="login-submit">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-center text-dark-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Register as Patient</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {demoLogins.map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => { setEmail(demo.email); setPassword(demo.password); }}
                  className="text-left p-2.5 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-xs group"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${demo.color}`} />
                    <span className="font-semibold text-dark-700 group-hover:text-primary-700">{demo.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
