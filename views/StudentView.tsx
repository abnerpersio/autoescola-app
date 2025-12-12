import React, { useState, useEffect } from 'react';
import { StorageService, WORKING_HOURS } from '../services/storage';
import { Appointment, DaySchedule, TimeSlot } from '../types';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input } from '../components/ui';
import { Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const StudentView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [overrides, setOverrides] = useState<DaySchedule[]>([]);
  const [studentName, setStudentName] = useState('João Silva'); // Default for prototype
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAppointments(StorageService.getAppointments());
    setOverrides(StorageService.getScheduleOverrides());
  };

  // Helper to format date key YYYY-MM-DD
  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  // Generate next 7 days for the date picker
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  // Generate slots for selected day
  const getSlotsForDay = (date: Date): TimeSlot[] => {
    const dateKey = formatDateKey(date);
    const dayOverride = overrides.find(o => o.date === dateKey);

    // If day is fully blocked
    if (dayOverride?.isBlocked) return [];

    return WORKING_HOURS.map(time => {
      const existingAppt = appointments.find(a => a.date === dateKey && a.time === time && a.status !== 'rejected');
      const isBlocked = dayOverride?.blockedHours.includes(time);
      
      let reason: TimeSlot['reason'] = undefined;
      let available = true;

      if (existingAppt) {
        available = false;
        reason = 'booked';
      } else if (isBlocked) {
        available = false;
        reason = 'blocked';
      }

      return { time, available, reason, appointment: existingAppt };
    });
  };

  const handleBooking = () => {
    if (!bookingSlot || !studentName) return;

    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      date: formatDateKey(selectedDate),
      time: bookingSlot,
      studentName: studentName,
      status: 'pending'
    };

    StorageService.saveAppointment(newAppt);
    setBookingSlot(null);
    loadData();
    alert('Solicitação de aula enviada com sucesso! Aguarde a aprovação do instrutor.');
  };

  const myAppointments = appointments.filter(a => a.studentName === studentName);
  const slots = getSlotsForDay(selectedDate);
  const weekDays = getNextDays();

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge variant="success">Confirmado</Badge>;
      case 'rejected': return <Badge variant="error">Recusado</Badge>;
      case 'pending': return <Badge variant="warning">Pendente</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Olá, Aluno!</h1>
        <p className="text-primary-100 max-w-xl">
          Marque suas aulas práticas com facilidade. Selecione um dia, escolha um horário disponível e envie sua solicitação.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="text-primary-600" size={20} />
                Agendar Nova Aula
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Date Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-500 mb-2 block">Selecione o dia</label>
                <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
                  {weekDays.map((day, idx) => {
                    const isSelected = formatDateKey(day) === formatDateKey(selectedDate);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                            setSelectedDate(day);
                            setBookingSlot(null);
                        }}
                        className={`flex flex-col items-center min-w-[4.5rem] p-3 rounded-xl border transition-all ${
                          isSelected 
                            ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-200' 
                            : 'bg-white border-slate-200 hover:border-primary-300'
                        }`}
                      >
                        <span className={`text-xs font-semibold uppercase mb-1 ${isSelected ? 'text-primary-700' : 'text-slate-500'}`}>
                          {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </span>
                        <span className={`text-xl font-bold ${isSelected ? 'text-primary-900' : 'text-slate-700'}`}>
                          {day.getDate()}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Slots Grid */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-500 mb-2 block">
                  Horários para {selectedDate.toLocaleDateString('pt-BR')}
                </label>
                
                {slots.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <AlertCircle className="mx-auto text-slate-400 mb-2" />
                    <p className="text-slate-500">O instrutor não está disponível nesta data.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setBookingSlot(slot.time)}
                        className={`
                          py-2 px-1 rounded-md text-sm font-medium border transition-all
                          ${!slot.available 
                            ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed decoration-slate-400' 
                            : bookingSlot === slot.time
                              ? 'bg-primary-600 text-white border-primary-600 shadow-md transform scale-105'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-primary-400 hover:text-primary-600'
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Booking Confirmation Area */}
              {bookingSlot && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">Confirmar Agendamento</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500">Seu Nome</label>
                      <Input 
                        value={studentName} 
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Digite seu nome completo"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-700 bg-white p-2 rounded border border-slate-200">
                      <span>Data: <strong>{selectedDate.toLocaleDateString('pt-BR')}</strong></span>
                      <span>Horário: <strong>{bookingSlot}</strong></span>
                    </div>
                    <Button onClick={handleBooking} className="w-full">
                      Solicitar Agendamento
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Schedule Side Panel */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Minhas Aulas</CardTitle>
            </CardHeader>
            <CardContent>
              {myAppointments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Nenhuma aula agendada.
                </div>
              ) : (
                <div className="space-y-3">
                  {myAppointments
                    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                    .map((appt) => (
                    <div key={appt.id} className="flex items-start justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white transition-colors">
                      <div>
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          <Clock size={14} className="text-primary-500"/> 
                          {new Date(appt.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">{appt.time}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(appt.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};