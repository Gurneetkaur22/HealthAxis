import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSchedules, mockDaysOff, mockDoctors } from '@/data/mockData';
import { DoctorSchedule, DayOff } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Plus, Trash2, CalendarX, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Schedule() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [selectedDoctor, setSelectedDoctor] = useState(mockDoctors[0].id);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>(mockSchedules);
  const [daysOff, setDaysOff] = useState<DayOff[]>(mockDaysOff);
  const [newDayOff, setNewDayOff] = useState('');
  const [newDayOffReason, setNewDayOffReason] = useState('');

  const handleToggleDay = (dayOfWeek: number) => {
    setSchedules(prev => prev.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, isAvailable: !s.isAvailable } : s
    ));
  };

  const handleTimeChange = (dayOfWeek: number, field: 'timeStart' | 'timeEnd', value: string) => {
    setSchedules(prev => prev.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
    ));
  };

  const handleAddDayOff = () => {
    if (!newDayOff) return;
    const newEntry: DayOff = {
      id: `d${Date.now()}`,
      doctorId: selectedDoctor,
      date: newDayOff,
      reason: newDayOffReason || undefined,
    };
    setDaysOff(prev => [...prev, newEntry]);
    setNewDayOff('');
    setNewDayOffReason('');
    toast.success('Day off added');
  };

  const handleRemoveDayOff = (id: string) => {
    setDaysOff(prev => prev.filter(d => d.id !== id));
    toast.success('Day off removed');
  };

  const handleSave = () => {
    toast.success('Schedule saved successfully!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {isAdmin ? 'Doctor Schedules' : 'My Schedule'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? 'Manage doctor availability and working hours' : 'Set your working hours and days off'}
          </p>
        </div>
        <Button onClick={handleSave} className="gradient-primary text-primary-foreground border-0 gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      {/* Admin: Doctor Selector */}
      {isAdmin && (
        <div className="max-w-xs">
          <label className="text-sm font-medium text-foreground mb-1.5 block">Select Doctor</label>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockDoctors.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.fullName} — {d.specialization}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-semibold text-foreground">Weekly Working Hours</h2>
        </div>
        <div className="divide-y divide-border">
          {DAYS.map((day, idx) => {
            const schedule = schedules.find(s => s.dayOfWeek === idx);
            const isAvailable = schedule?.isAvailable ?? false;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={cn(
                  'flex items-center gap-4 px-5 py-4 transition-colors',
                  !isAvailable && 'opacity-50'
                )}
              >
                <div className="w-28 flex-shrink-0">
                  <span className="text-sm font-semibold text-foreground">{day}</span>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={() => handleToggleDay(idx)}
                />
                {isAvailable && schedule ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={schedule.timeStart}
                      onChange={e => handleTimeChange(idx, 'timeStart', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <Input
                      type="time"
                      value={schedule.timeEnd}
                      onChange={e => handleTimeChange(idx, 'timeEnd', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-xs text-muted-foreground ml-2">
                      {schedule.slotDuration}min slots
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Day off</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Days Off */}
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <CalendarX className="w-5 h-5 text-destructive" />
          <h2 className="text-lg font-heading font-semibold text-foreground">Scheduled Days Off</h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Add day off */}
          <div className="flex flex-wrap gap-3">
            <Input
              type="date"
              value={newDayOff}
              onChange={e => setNewDayOff(e.target.value)}
              className="w-44"
            />
            <Input
              placeholder="Reason (optional)"
              value={newDayOffReason}
              onChange={e => setNewDayOffReason(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleAddDayOff} size="sm" variant="outline" className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {daysOff.map(d => (
              <div key={d.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-foreground">{d.date}</span>
                  {d.reason && <span className="text-sm text-muted-foreground ml-3">— {d.reason}</span>}
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleRemoveDayOff(d.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {daysOff.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No days off scheduled</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
