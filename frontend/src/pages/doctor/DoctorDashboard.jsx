import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatsCard from '../../components/common/StatsCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/appointments', { params: { limit: 50 } }).then((r) => setAppointments(r.data.appointments)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const today = new Date().toDateString();
  const todayApts = appointments.filter((a) => new Date(a.date).toDateString() === today);
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      <h1 className="page-title">Doctor Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Today's Appointments" value={todayApts.length} icon="📅" color="blue" />
        <StatsCard title="Pending" value={pending} icon="⏳" color="amber" />
        <StatsCard title="Completed" value={completed} icon="✅" color="green" />
      </div>
      <div className="card">
        <h3 className="font-semibold text-dark-800 mb-4">Today's Schedule</h3>
        {todayApts.length === 0 ? (
          <p className="text-dark-400 text-sm py-4 text-center">No appointments today</p>
        ) : (
          <div className="space-y-3">
            {todayApts.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => navigate(`/doctor/appointments/${apt._id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">{apt.patient?.user?.name?.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-dark-800">{apt.patient?.user?.name}</p>
                    <p className="text-xs text-dark-400">{apt.timeSlot} • {apt.reason || 'No reason specified'}</p>
                  </div>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
