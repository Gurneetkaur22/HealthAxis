import { User, Appointment, DoctorSchedule, DayOff } from '@/types';

// Mock current user - change role to test different views
export const currentUser: User = {
  id: '1',
  username: 'dr.sarah',
  email: 'sarah@healthaxis.com',
  fullName: 'Dr. Sarah Mitchell',
  role: 'doctor',
  specialization: 'Cardiology',
  phone: '+1 555-0123',
  avatar: '',
};

export const mockDoctors: User[] = [
  { id: '1', username: 'dr.sarah', email: 'sarah@healthaxis.com', fullName: 'Dr. Sarah Mitchell', role: 'doctor', specialization: 'Cardiology' },
  { id: '2', username: 'dr.james', email: 'james@healthaxis.com', fullName: 'Dr. James Wilson', role: 'doctor', specialization: 'Neurology' },
  { id: '3', username: 'dr.emily', email: 'emily@healthaxis.com', fullName: 'Dr. Emily Chen', role: 'doctor', specialization: 'Pediatrics' },
  { id: '4', username: 'dr.michael', email: 'michael@healthaxis.com', fullName: 'Dr. Michael Brown', role: 'doctor', specialization: 'Orthopedics' },
];

export const mockPatients: User[] = [
  { id: '10', username: 'john.d', email: 'john@email.com', fullName: 'John Davis', role: 'patient', age: 45, gender: 'Male', bloodGroup: 'A+', phone: '+1 555-0201' },
  { id: '11', username: 'maria.g', email: 'maria@email.com', fullName: 'Maria Garcia', role: 'patient', age: 32, gender: 'Female', bloodGroup: 'O+', phone: '+1 555-0202' },
  { id: '12', username: 'alex.k', email: 'alex@email.com', fullName: 'Alex Kim', role: 'patient', age: 28, gender: 'Male', bloodGroup: 'B-', phone: '+1 555-0203' },
  { id: '13', username: 'lisa.w', email: 'lisa@email.com', fullName: 'Lisa Wang', role: 'patient', age: 55, gender: 'Female', bloodGroup: 'AB+', phone: '+1 555-0204' },
];

export const mockAppointments: Appointment[] = [
  { id: 'APT001', patientName: 'John Davis', doctorName: 'Dr. Sarah Mitchell', date: '2026-04-10', time: '09:00', status: 'confirmed', reason: 'Chest pain follow-up' },
  { id: 'APT002', patientName: 'Maria Garcia', doctorName: 'Dr. Sarah Mitchell', date: '2026-04-10', time: '10:30', status: 'pending', reason: 'Annual checkup' },
  { id: 'APT003', patientName: 'Alex Kim', doctorName: 'Dr. James Wilson', date: '2026-04-11', time: '14:00', status: 'confirmed', reason: 'Migraine consultation' },
  { id: 'APT004', patientName: 'Lisa Wang', doctorName: 'Dr. Emily Chen', date: '2026-04-11', time: '11:00', status: 'completed', reason: 'Blood pressure review' },
  { id: 'APT005', patientName: 'John Davis', doctorName: 'Dr. Michael Brown', date: '2026-04-12', time: '15:30', status: 'pending', reason: 'Knee pain' },
];

export const mockSchedules: DoctorSchedule[] = [
  { id: 's1', doctorId: '1', doctorName: 'Dr. Sarah Mitchell', dayOfWeek: 1, timeStart: '09:00', timeEnd: '17:00', isAvailable: true, slotDuration: 30 },
  { id: 's2', doctorId: '1', doctorName: 'Dr. Sarah Mitchell', dayOfWeek: 2, timeStart: '09:00', timeEnd: '17:00', isAvailable: true, slotDuration: 30 },
  { id: 's3', doctorId: '1', doctorName: 'Dr. Sarah Mitchell', dayOfWeek: 3, timeStart: '10:00', timeEnd: '15:00', isAvailable: true, slotDuration: 30 },
  { id: 's4', doctorId: '1', doctorName: 'Dr. Sarah Mitchell', dayOfWeek: 4, timeStart: '09:00', timeEnd: '17:00', isAvailable: true, slotDuration: 30 },
  { id: 's5', doctorId: '1', doctorName: 'Dr. Sarah Mitchell', dayOfWeek: 5, timeStart: '09:00', timeEnd: '13:00', isAvailable: true, slotDuration: 30 },
  { id: 's6', doctorId: '1', doctorName: 'Dr. Sarah Mitchell', dayOfWeek: 6, timeStart: '00:00', timeEnd: '00:00', isAvailable: false, slotDuration: 30 },
  { id: 's7', doctorId: '1', doctorName: 'Dr. Sarah Mitchell', dayOfWeek: 0, timeStart: '00:00', timeEnd: '00:00', isAvailable: false, slotDuration: 30 },
];

export const mockDaysOff: DayOff[] = [
  { id: 'd1', doctorId: '1', date: '2026-04-15', reason: 'Conference' },
  { id: 'd2', doctorId: '1', date: '2026-04-25', reason: 'Personal' },
];
