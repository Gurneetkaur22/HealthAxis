import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatsCard from '../../components/common/StatsCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard').then((res) => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  const appointmentTrend = (stats.monthlyAppointments || []).map((m) => ({ month: m._id, count: m.count }));
  const revenueTrend = (stats.monthlyRevenue || []).map((m) => ({ month: m._id, revenue: m.total }));
  const deptData = (stats.departmentPatients || []).map((d) => ({ name: d.name, count: d.count }));
  const bedData = [
    { name: 'Occupied', value: stats.occupiedBeds },
    { name: 'Available', value: stats.availableBeds },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-title">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Patients" value={stats.totalPatients} icon="👥" color="blue" />
        <StatsCard title="Total Doctors" value={stats.totalDoctors} icon="🩺" color="green" />
        <StatsCard title="Appointments" value={stats.totalAppointments} icon="📅" color="purple" />
        <StatsCard title="Revenue" value={`₹${stats.totalRevenue?.toLocaleString()}`} icon="💰" color="amber" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-dark-800 mb-4">Appointment Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={appointmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-dark-800 mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-dark-800 mb-4">Patients by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-dark-800 mb-4">Bed Occupancy</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={bedData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#22c55e" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-dark-800 mb-4">Recent Appointments</h3>
          <div className="space-y-3">
            {(stats.recentAppointments || []).map((apt) => (
              <div key={apt._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-dark-800">{apt.patient?.user?.name || 'N/A'}</p>
                  <p className="text-xs text-dark-400">Dr. {apt.doctor?.user?.name || 'N/A'} • {new Date(apt.date).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-dark-800 mb-4">Recent Billing</h3>
          <div className="space-y-3">
            {(stats.recentBillings || []).map((bill) => (
              <div key={bill._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-dark-800">{bill.patient?.user?.name || 'N/A'}</p>
                  <p className="text-xs text-dark-400">₹{bill.totalAmount?.toLocaleString()} • {new Date(bill.date).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={bill.paymentStatus} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
