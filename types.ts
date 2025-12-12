export type UserRole = 'student' | 'instructor';

export type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Appointment {
  id: string;
  studentName: string;
  date: string; // ISO Date String YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  isBlocked: boolean; // If the instructor blocked the whole day
  blockedHours: string[]; // Specific hours blocked manually
}

// Helper interface for UI
export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: 'booked' | 'blocked' | 'past';
  appointment?: Appointment;
}