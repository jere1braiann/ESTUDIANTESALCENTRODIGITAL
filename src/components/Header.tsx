import React from 'react';
import { Role, User } from '../types';
import {
  Vote,
  Shield,
  BookOpen,
  FileText,
  UserCheck,
  Globe,
  Layers,
  ChevronDown,
  School as SchoolIcon,
  LogOut,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  currentView: 'public' | 'voting' | 'portal' | 'architecture';
  setCurrentView: (view: 'public' | 'voting' | 'portal' | 'architecture') => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  usersList: User[];
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  currentUser,
  setCurrentUser,
  usersList = [],
  onOpenArchitecture,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.SUPERADMIN:
        return {
          label: 'SuperAdmin Provincial',
          desc: 'Agencia Córdoba Joven / Min. Educación',
          color: 'bg-indigo-600 text-white border-indigo-700',
          icon: <Shield className="w-3.5 h-3.5" />,
        };
      case Role.ADMIN_CD:
        return {
          label: 'Admin CD',
          desc: 'Centro de Estudiantes (Activo)',
          color: 'bg-blue-600 text-white border-blue-700',
          icon: <BookOpen className="w-3.5 h-3.5" />,
        };
      case Role.ADMIN_JUNTA:
        return {
          label: 'Admin Junta',
          desc: 'Junta Electoral (Temporal - Art. 25)',
          color: 'bg-emerald-600 text-white border-emerald-700',
          icon: <UserCheck className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: 'Usuario',
          desc: 'Sistema',
          color: 'bg-slate-600 text-white border-slate-700',
          icon: <UserCheck className="w-3.5 h-3.5" />,
        };
    }
  };

  const currentRoleInfo = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Ministerial Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-sky-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              GOBIERNO DE LA PROVINCIA DE CÓRDOBA
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-300 hidden sm:inline">Agencia Córdoba Joven &bull; Ministerio de Educación</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-sky-950/80 text-sky-300 border border-sky-800/60 px-2 py-0.5 rounded font-mono text-[11px]">
              Resolución Nº 124/2010
            </span>
            <button
              onClick={onOpenArchitecture}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded transition"
              title="Ver Especificación de Arquitectura de Software, Diagrama y Base de Datos"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Arquitectura & DB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('public')}>
          {/* Official Emblem */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 font-black text-xl tracking-tighter">
            <span className="flex items-center justify-center">📢</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-none">
                Estudiantes <span className="text-blue-600">al Centro</span>
              </h1>
              <span className="hidden md:inline-block bg-red-100 text-red-700 font-bold text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                Córdoba
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              Estatuto Modelo de Centros de Estudiantes &bull; Res. 124
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Public Portal */}
          <button
            id="nav-public-tab"
            onClick={() => setCurrentView('public')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              currentView === 'public'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Página Pública & Foro</span>
          </button>

          {/* Presential Voting Booth */}
          <button
            id="nav-biombo-tab"
            onClick={() => setCurrentView('voting')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              currentView === 'voting'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <Vote className="w-4 h-4" />
            <span className="font-bold">Biombo de Votación</span>
            <span className="hidden lg:inline-block text-[10px] bg-red-800/40 text-red-100 px-1.5 py-0.2 rounded-full uppercase">
              Netbooks
            </span>
          </button>

          {/* Private Portal */}
          <button
            id="nav-portal-tab"
            onClick={() => {
              if (!currentUser && usersList.length > 0) {
                setCurrentUser(usersList[0]);
              }
              setCurrentView('portal');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              currentView === 'portal'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Portal de Gestión</span>
          </button>
        </nav>

        {/* User Role Switcher */}
        <div className="relative">
          {currentUser ? (
            <button
              id="user-role-menu-button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left text-xs transition ${
                currentRoleInfo?.color || 'bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {currentRoleInfo?.icon}
                <div className="hidden sm:block">
                  <div className="font-bold text-[12px] leading-tight">{currentRoleInfo?.label}</div>
                  <div className="text-[10px] opacity-85 truncate max-w-[140px]">
                    {currentUser.schoolName || currentUser.fullName}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-75" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (usersList.length > 0) {
                  setCurrentUser(usersList[0]);
                  setCurrentView('portal');
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-2 rounded-lg transition"
            >
              Iniciar Sesión
            </button>
          )}

          {/* Role selector dropdown */}
          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Seleccionar Rol / Perfil Demo:
              </div>

              <div className="mt-1 space-y-1">
                {usersList.map(user => {
                  const info = getRoleBadge(user.role);
                  const isSelected = currentUser?.id === user.id;

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setRoleDropdownOpen(false);
                        setCurrentView('portal');
                      }}
                      className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition text-xs ${
                        isSelected
                          ? 'bg-slate-100 border border-slate-300 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${info.color} mt-0.5`}>
                        {info.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>{info.label}</span>
                          {user.isJuntaDisolved && (
                            <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-normal">
                              DISUELTA
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate">{user.fullName}</div>
                        <div className="text-slate-400 text-[10px] truncate">{user.schoolName}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-[11px] text-slate-500">
                <span>Res. 124/10 RBAC</span>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setRoleDropdownOpen(false);
                    setCurrentView('public');
                  }}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
                >
                  <LogOut className="w-3 h-3" />
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
