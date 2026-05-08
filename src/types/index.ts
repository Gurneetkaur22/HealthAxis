export type UserRole = 'patient' | 'doctor' | 'admin' | 'receptionist';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  specialization?: string;
  phone?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  prescription?: string;
  reason?: string;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  doctorName: string;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  timeStart: string; // "09:00"
  timeEnd: string;   // "17:00"
  isAvailable: boolean;
  slotDuration: number; // minutes
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DayOff {
  id: string;
  doctorId: string;
  date: string;
  reason?: string;
}
