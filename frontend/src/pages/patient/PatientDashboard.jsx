import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatsCard from '../../components/common/StatsCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const [data, setData] = useState({ appointments: [], prescriptions: [], bills: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/appointments', { params: { limit: 5 } }),
      API.get('/prescriptions'),
      API.get('/billing', { params: { limit: 5 } }),
    ]).then(([a, p, b]) => {
      setData({ appointments: a.data.appointments || [], prescriptions: p.data || [], bills: b.data.billings || [] });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const upcoming = data.appointments.filter((a) => a.status !== 'completed' && a.status !== 'cancelled').length;

  return (
    <div className="space-y-6">
      <h1 className="page-title">My Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Upcoming Appointments" value={upcoming} icon="📅" color="blue" />
        <StatsCard title="Prescriptions" value={data.prescriptions.length} icon="💊" color="green" />
        <StatsCard title="Bills" value={data.bills.length} icon="💰" color="amber" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Appointments</h3>
            <button onClick={() => navigate('/patient/appointments')} className="text-sm text-primary-600 hover:underline">View all</button>
          </div>
          {data.appointments.slice(0, 3).map((apt) => (
            <div key={apt._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium">{apt.doctor?.user?.name}</p>
                <p className="text-xs text-dark-400">{new Date(apt.date).toLocaleDateString()} • {apt.timeSlot}</p>
              </div>
              <StatusBadge status={apt.status} />
            </div>
          ))}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Book Appointment', path: '/patient/book-appointment', icon: '📅', color: 'bg-blue-50' },
              { label: 'My Prescriptions', path: '/patient/prescriptions', icon: '💊', color: 'bg-green-50' },
              { label: 'My Bills', path: '/patient/billing', icon: '💰', color: 'bg-amber-50' },
              { label: 'My Profile', path: '/patient/profile', icon: '👤', color: 'bg-purple-50' },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.path)} className={`p-4 rounded-xl ${a.color} hover:shadow-sm transition-all text-left`}>
                <span className="text-2xl block mb-1">{a.icon}</span>
                <span className="text-sm font-medium text-dark-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
