import { Appointment, DaySchedule } from '../types';

const APPOINTMENTS_KEY = 'autoescola_appointments';
const SCHEDULE_KEY = 'autoescola_schedule';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Default hours available: 08:00 to 18:00
export const WORKING_HOURS = [
  '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export const StorageService = {
  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(APPOINTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAppointment: (appt: Appointment) => {
    const appointments = StorageService.getAppointments();
    appointments.push(appt);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  },

  updateAppointmentStatus: (id: string, status: Appointment['status']) => {
    const appointments = StorageService.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index].status = status;
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    }
  },

  getScheduleOverrides: (): DaySchedule[] => {
    const data = localStorage.getItem(SCHEDULE_KEY);
    return data ? JSON.parse(data) : [];
  },

  toggleDayBlock: (date: string) => {
    const schedules = StorageService.getScheduleOverrides();
    const existingIndex = schedules.findIndex(s => s.date === date);
    
    if (existingIndex !== -1) {
      schedules[existingIndex].isBlocked = !schedules[existingIndex].isBlocked;
    } else {
      schedules.push({ date, isBlocked: true, blockedHours: [] });
    }
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedules));
  },

  // Reset for demo purposes
  reset: () => {
    localStorage.removeItem(APPOINTMENTS_KEY);
    localStorage.removeItem(SCHEDULE_KEY);
  }
};