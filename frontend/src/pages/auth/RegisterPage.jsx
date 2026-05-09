import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">H</div>
          <h1 className="text-xl font-bold text-dark-900">HealthAxis</h1>
        </div>
        <div className="card">
          <h2 className="text-2xl font-bold text-dark-900 mb-1">Create Account</h2>
          <p className="text-dark-500 mb-6">Register as a patient to get started</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" placeholder="Your full name" id="register-name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input-field" placeholder="you@example.com" id="register-email" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input-field" placeholder="Min 6 characters" id="register-password" />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} className="input-field" placeholder="Repeat password" id="register-confirm" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full" id="register-submit">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-sm text-center text-dark-500 mt-4">
            Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
