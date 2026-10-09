import React from 'react';
import { Heart, FileText, CalendarCheck, Settings, LogOut, LayoutDashboard, UserCheck, CheckCircle2 } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'budgets' | 'events' | 'settings';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  onOpenGuestPreview?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-11 h-11 rounded-2xl bg-[#882C4E] flex items-center justify-center text-white shadow-md shadow-rose-900/15 shrink-0">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#882C4E]">
                Amor Perfeito
              </div>
              <p className="text-[11px] text-stone-500 font-medium tracking-wide">
                Cerimonial & Assessoria de Eventos
              </p>
            </div>
          </div>

          {/* Clean Organized Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#882C4E] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel</span>
            </button>

            <button
              onClick={() => setActiveTab('budgets')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'budgets'
                  ? 'bg-white text-[#882C4E] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Orçamentos</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-white text-[#882C4E] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Eventos</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-[#882C4E] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>
          </nav>

          {/* User Session & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-semibold text-[#882C4E]">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Admin Conectado</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-medium transition cursor-pointer"
              title="Sair do painel administrativo"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Clean Mobile Nav Bar */}
        <div className="flex lg:hidden border-t border-stone-100 py-2.5 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-[#882C4E] text-white shadow-xs' : 'text-stone-600 bg-stone-50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Painel</span>
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold whitespace-nowrap ${
              activeTab === 'budgets' ? 'bg-[#882C4E] text-white shadow-xs' : 'text-stone-600 bg-stone-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Orçamentos</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold whitespace-nowrap ${
              activeTab === 'events' ? 'bg-[#882C4E] text-white shadow-xs' : 'text-stone-600 bg-stone-50'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Eventos</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-[#882C4E] text-white shadow-xs' : 'text-stone-600 bg-stone-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Ajustes</span>
          </button>
        </div>
      </div>
    </header>
  );
};
