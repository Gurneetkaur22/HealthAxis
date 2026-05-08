import { useState, useMemo } from 'react';
import { mockDoctors, mockSchedules, mockDaysOff, mockAppointments } from '@/data/mockData';
import { TimeSlot } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function generateTimeSlots(
  schedules: typeof mockSchedules,
  daysOff: typeof mockDaysOff,
  existingAppointments: typeof mockAppointments,
  doctorId: string,
  date: Date
): TimeSlot[] {
  const dayOfWeek = date.getDay();
  const dateStr = format(date, 'yyyy-MM-dd');

  // Check day off
  if (daysOff.some(d => d.doctorId === doctorId && d.date === dateStr)) {
    return [];
  }

  const schedule = schedules.find(s => s.doctorId === doctorId && s.dayOfWeek === dayOfWeek);
  if (!schedule || !schedule.isAvailable) return [];

  const slots: TimeSlot[] = [];
  const [startH, startM] = schedule.timeStart.split(':').map(Number);
  const [endH, endM] = schedule.timeEnd.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  const doctor = mockDoctors.find(d => d.id === doctorId);
  const bookedTimes = existingAppointments
    .filter(a => a.doctorName === doctor?.fullName && a.date === dateStr && a.status !== 'cancelled')
    .map(a => a.time);

  for (let m = startMin; m < endMin; m += schedule.slotDuration) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const timeStr = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    slots.push({
      time: timeStr,
      available: !bookedTimes.includes(timeStr),
    });
  }

  return slots;
}

export default function BookAppointment() {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [reason, setReason] = useState('');
  const [booked, setBooked] = useState(false);

  const timeSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    return generateTimeSlots(mockSchedules, mockDaysOff, mockAppointments, selectedDoctor, selectedDate);
  }, [selectedDoctor, selectedDate]);

  const selectedDoctorData = mockDoctors.find(d => d.id === selectedDoctor);

  const handleBook = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !patientName) {
      toast.error('Please fill all required fields');
      return;
    }
    setBooked(true);
    toast.success('Appointment booked successfully!');
  };

  if (booked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card rounded-2xl border border-border p-10 text-center shadow-card max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-2">Appointment Booked!</h2>
          <p className="text-muted-foreground text-sm mb-1">
            <strong>{patientName}</strong> with <strong>{selectedDoctorData?.fullName}</strong>
          </p>
          <p className="text-muted-foreground text-sm">
            {selectedDate && format(selectedDate, 'PPP')} at {selectedTime}
          </p>
          <Button onClick={() => { setBooked(false); setSelectedTime(''); }} className="mt-6" variant="outline">
            Book Another
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Book Appointment</h1>
        <p className="text-sm text-muted-foreground mt-1">Select a doctor, date, and available time slot</p>
      </div>

      <div className="space-y-6">
        {/* Patient Name */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Patient Name *</label>
          <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Enter patient name" className="max-w-sm" />
        </div>

        {/* Doctor Selection */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Select Doctor *</label>
          <Select value={selectedDoctor} onValueChange={v => { setSelectedDoctor(v); setSelectedTime(''); }}>
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Choose a doctor" />
            </SelectTrigger>
            <SelectContent>
              {mockDoctors.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.fullName} — {d.specialization}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Picker */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Select Date *</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-[240px] justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={d => { setSelectedDate(d); setSelectedTime(''); }}
                disabled={date => date < new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Slots */}
        {selectedDoctor && selectedDate && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Available Time Slots
            </label>
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200',
                      slot.available && selectedTime !== slot.time && 'border-border bg-card text-foreground hover:border-primary hover:bg-primary/5',
                      selectedTime === slot.time && 'gradient-primary text-primary-foreground border-transparent',
                      !slot.available && 'bg-muted text-muted-foreground/40 border-transparent cursor-not-allowed line-through'
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
                No available slots for this date. The doctor may be off or fully booked.
              </p>
            )}
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Reason for Visit</label>
          <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe your symptoms or reason..." className="max-w-sm" rows={3} />
        </div>

        <Button onClick={handleBook} className="gradient-primary text-primary-foreground border-0 px-8" disabled={!selectedDoctor || !selectedDate || !selectedTime || !patientName}>
          Book Appointment
        </Button>
      </div>
    </div>
  );
}
