import { useAuth } from '@/contexts/AuthContext';
import { mockAppointments, mockDoctors, mockPatients } from '@/data/mockData';
import { StatCard, StatusBadge } from '@/components/StatCard';
import { Calendar, Users, Stethoscope, Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();

  const todayAppointments = mockAppointments.filter(a => a.date === '2026-04-10');
  const pendingCount = mockAppointments.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Welcome back, <span className="text-gradient">{user.fullName.split(' ')[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening today at HealthAxis</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={todayAppointments.length} icon={Calendar} trend={{ value: '12% from yesterday', positive: true }} />
        <StatCard label="Total Patients" value={mockPatients.length} icon={Users} trend={{ value: '3 new this week', positive: true }} />
        <StatCard label="Active Doctors" value={mockDoctors.length} icon={Stethoscope} />
        <StatCard label="Pending Approvals" value={pendingCount} icon={Clock} />
      </div>

      {/* Recent Appointments */}
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-heading font-semibold text-foreground">Recent Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Patient</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Doctor</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Date & Time</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockAppointments.map((apt, i) => (
                <motion.tr
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-mono text-primary font-medium">{apt.id}</td>
                  <td className="px-5 py-3.5 text-sm text-foreground">{apt.patientName}</td>
                  <td className="px-5 py-3.5 text-sm text-foreground">{apt.doctorName}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{apt.date} at {apt.time}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={apt.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Calendar, title: 'Book Appointment', desc: 'Schedule a new appointment', color: 'gradient-primary' },
          { icon: Activity, title: 'View Reports', desc: 'Access medical reports', color: 'bg-accent' },
          { icon: Users, title: 'Manage Patients', desc: 'View and edit patient records', color: 'bg-info' },
        ].map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-card rounded-xl p-5 border border-border shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
              <action.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">{action.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
