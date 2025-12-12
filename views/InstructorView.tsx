import React, { useState, useEffect } from 'react';
import { StorageService, WORKING_HOURS } from '../services/storage';
import { Appointment, DaySchedule } from '../types';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import { Calendar, Check, X, User, Ban, Clock } from 'lucide-react';

export const InstructorView: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [overrides, setOverrides] = useState<DaySchedule[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setAppointments(StorageService.getAppointments());
    setOverrides(StorageService.getScheduleOverrides());
  };

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    StorageService.updateAppointmentStatus(id, status);
    refreshData();
  };

  const toggleDayBlock = (date: string) => {
    StorageService.toggleDayBlock(date);
    refreshData();
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  
  // Get appointments for the selected day for the timeline view
  const todaysAppointments = appointments.filter(
    a => a.date === currentDate && a.status === 'approved'
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Check if current day is blocked
  const isCurrentDayBlocked = overrides.find(o => o.date === currentDate)?.isBlocked;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel do Instrutor</h1>
            <p className="text-slate-500">Gerencie sua agenda e solicitações de alunos</p>
        </div>
        
        {/* Simple Date Picker for Dashboard View */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <label className="text-sm font-medium text-slate-600 pl-2">Visualizar dia:</label>
            <input 
                type="date" 
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="border-none bg-transparent text-sm font-medium focus:ring-0 text-slate-900"
            />
        </div>
      </div>

      {/* Quick Stats / Pending Actions */}
      {pendingAppointments.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Clock size={20} />
              Solicitações Pendentes ({pendingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAppointments.map(appt => (
                <div key={appt.id} className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 flex flex-col justify-between">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <User size={16} className="text-slate-400" />
                      {appt.studentName}
                    </div>
                    <div className="text-sm text-slate-500 mt-1 pl-6">
                      {new Date(appt.date).toLocaleDateString('pt-BR')} às <span className="font-medium text-slate-900">{appt.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusChange(appt.id, 'approved')}
                    >
                      <Check size={16} className="mr-1" /> Aceitar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                      onClick={() => handleStatusChange(appt.id, 'rejected')}
                    >
                      <X size={16} className="mr-1" /> Recusar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Agenda do Dia</CardTitle>
              <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">
                    {new Date(currentDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long'})}
                  </span>
                  {isCurrentDayBlocked && <Badge variant="error">Dia Bloqueado</Badge>}
              </div>
            </CardHeader>
            <CardContent>
                {isCurrentDayBlocked ? (
                    <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                        <Ban className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <p>Você bloqueou este dia para aulas.</p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4"
                            onClick={() => toggleDayBlock(currentDate)}
                        >
                            Desbloquear Dia
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {WORKING_HOURS.map(hour => {
                            const appt = todaysAppointments.find(a => a.time === hour);
                            return (
                                <div key={hour} className={`flex items-center p-3 rounded-lg border ${appt ? 'bg-primary-50 border-primary-200' : 'bg-white border-slate-100'}`}>
                                    <div className="w-20 font-mono text-slate-500 font-medium">{hour}</div>
                                    <div className="flex-1">
                                        {appt ? (
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-primary-900">{appt.studentName}</span>
                                                <Badge variant="success">Confirmado</Badge>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-sm italic">Disponível</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Availability Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar size={18} />
                Gerenciar Disponibilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-2 text-sm">Controle Rápido</h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Bloqueie o dia atual ({new Date(currentDate).toLocaleDateString('pt-BR')}) para impedir novos agendamentos.
                        </p>
                        <Button 
                            variant={isCurrentDayBlocked ? "outline" : "destructive"} 
                            className="w-full"
                            onClick={() => toggleDayBlock(currentDate)}
                        >
                            {isCurrentDayBlocked ? "Desbloquear este dia" : "Bloquear o dia inteiro"}
                        </Button>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-2 text-sm">Configuração Geral</h4>
                        <p className="text-xs text-slate-500 mb-2">
                            Horários padrão: 08:00 às 17:00 (Seg-Sex)
                        </p>
                        <Button variant="outline" size="sm" className="w-full" disabled>
                            Editar Horários Padrão
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};