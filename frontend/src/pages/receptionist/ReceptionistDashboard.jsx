import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatsCard from '../../components/common/StatsCard';
import { useNavigate } from 'react-router-dom';

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState({ patients: 0, appointments: 0, todayApts: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/patients', { params: { limit: 1 } }),
      API.get('/appointments', { params: { limit: 1 } }),
      API.get('/appointments', { params: { limit: 1, date: new Date().toISOString().split('T')[0] } }),
    ]).then(([p, a, t]) => {
      setStats({ patients: p.data.total || 0, appointments: a.data.total || 0, todayApts: t.data.total || 0 });
    }).catch(() => {});
  }, []);

  const quickActions = [
    { label: 'Register Patient', icon: '👤', path: '/receptionist/register-patient', color: 'bg-blue-50 text-blue-600' },
    { label: 'Book Appointment', icon: '📅', path: '/receptionist/book-appointment', color: 'bg-green-50 text-green-600' },
    { label: 'Create Bill', icon: '💰', path: '/receptionist/billing', color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-title">Receptionist Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Patients" value={stats.patients} icon="👥" color="blue" />
        <StatsCard title="Total Appointments" value={stats.appointments} icon="📅" color="green" />
        <StatsCard title="Today's Appointments" value={stats.todayApts} icon="🕐" color="amber" />
      </div>
      <div className="card">
        <h3 className="font-semibold text-dark-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => navigate(a.path)} className={`p-6 rounded-xl ${a.color} hover:shadow-md transition-all text-left`}>
              <span className="text-3xl mb-3 block">{a.icon}</span>
              <span className="font-semibold text-sm">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
