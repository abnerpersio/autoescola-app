import React from 'react';
import { UserRole } from '../types';
import { Button } from './ui';
import { Car, User, GraduationCap, RefreshCw } from 'lucide-react';
import { StorageService } from '../services/storage';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentRole, onSwitchRole }) => {
  const handleReset = () => {
    if(confirm("Deseja apagar todos os dados e reiniciar o protótipo?")) {
      StorageService.reset();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-primary-600">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Car size={24} />
            </div>
            <span className="font-bold text-lg hidden md:block tracking-tight">AutoEscola Connect</span>
            <span className="font-bold text-lg md:hidden">Connect</span>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => onSwitchRole('student')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  currentRole === 'student' 
                    ? 'bg-white text-primary-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <User size={16} />
                <span className="hidden sm:inline">Aluno</span>
              </button>
              <button
                onClick={() => onSwitchRole('instructor')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  currentRole === 'instructor' 
                    ? 'bg-white text-primary-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <GraduationCap size={16} />
                <span className="hidden sm:inline">Professor</span>
              </button>
            </div>
            
            <button 
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Resetar dados"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 AutoEscola Connect. Protótipo de Demonstração.</p>
        </div>
      </footer>
    </div>
  );
};