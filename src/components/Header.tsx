import React from 'react';
import { Heart, FileText, CalendarCheck, Settings, LogOut, LayoutDashboard, ExternalLink, Sparkles } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'budgets' | 'events' | 'settings';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  onOpenGuestPreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  onOpenGuestPreview,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#882C4E] to-[#B85C7D] flex items-center justify-center shadow-md shadow-rose-900/10 text-white">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#882C4E]">
                  Amor Perfeito
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-[#882C4E] border border-rose-200">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  Cerimonial
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium tracking-wide">
                Assessoria, Orçamentos & Gestão de RSVP
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#882C4E] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel</span>
            </button>

            <button
              onClick={() => setActiveTab('budgets')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'budgets'
                  ? 'bg-white text-[#882C4E] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Orçamentos (PDF/Zap)</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-white text-[#882C4E] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Eventos & RSVP</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-[#882C4E] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>
          </nav>

          {/* Actions on right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenGuestPreview}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-50 to-rose-50 hover:from-amber-100 hover:to-rose-100 text-[#882C4E] border border-rose-200/80 rounded-xl text-xs font-medium transition shadow-2xs cursor-pointer"
              title="Testar como um convidado vê a confirmação de presença"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Página de RSVP (Convidado)</span>
              <span className="sm:hidden">RSVP</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-medium transition cursor-pointer"
              title="Sair do painel administrativo"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex md:hidden border-t border-stone-100 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium ${
              activeTab === 'dashboard' ? 'bg-rose-50 text-[#882C4E] font-semibold' : 'text-stone-600'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Painel</span>
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium ${
              activeTab === 'budgets' ? 'bg-rose-50 text-[#882C4E] font-semibold' : 'text-stone-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Orçamentos</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium ${
              activeTab === 'events' ? 'bg-rose-50 text-[#882C4E] font-semibold' : 'text-stone-600'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>RSVP</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium ${
              activeTab === 'settings' ? 'bg-rose-50 text-[#882C4E] font-semibold' : 'text-stone-600'
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
