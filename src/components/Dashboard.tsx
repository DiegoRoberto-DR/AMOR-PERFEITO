import React from 'react';
import { Budget, EventRsvp, CerimonialSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/pdfGenerator';
import { 
  FileText, CalendarCheck, Users, TrendingUp, Plus, 
  Share2, ArrowRight, CheckCircle2, Clock, MapPin, 
  Sparkles, Download, MessageCircle
} from 'lucide-react';

interface DashboardProps {
  budgets: Budget[];
  events: EventRsvp[];
  settings: CerimonialSettings;
  onNewBudget: () => void;
  onNewEvent: () => void;
  onViewBudget: (budget: Budget) => void;
  onDownloadBudgetPdf: (budget: Budget) => void;
  onSendBudgetWhatsapp: (budget: Budget) => void;
  onOpenEventGuests: (event: EventRsvp) => void;
  onShareEvent: (event: EventRsvp) => void;
  onNavigateTab: (tab: 'budgets' | 'events') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  budgets,
  events,
  onNewBudget,
  onNewEvent,
  onViewBudget,
  onDownloadBudgetPdf,
  onSendBudgetWhatsapp,
  onOpenEventGuests,
  onShareEvent,
  onNavigateTab,
}) => {
  // Stats
  const totalBudgetsValue = budgets.reduce((acc, b) => acc + (b.total || 0), 0);
  const approvedBudgets = budgets.filter(b => b.status === 'Aprovado' || b.status === 'Fechado');
  const approvedValue = approvedBudgets.reduce((acc, b) => acc + (b.total || 0), 0);

  const allGuests = events.flatMap(e => e.guests);
  const totalGuests = allGuests.length;
  const confirmedGuestsCount = allGuests
    .filter(g => g.status === 'confirmed')
    .reduce((acc, g) => acc + (g.confirmedCount || 1), 0);
  const pendingGuestsCount = allGuests.filter(g => g.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B2444] via-[#882C4E] to-[#B35677] text-white p-6 sm:p-10 shadow-xl shadow-rose-950/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-medium text-rose-100 border border-white/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Cerimonial Amor Perfeito • Painel de Controle</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
            Bem-vindo ao seu cerimonial de excelência.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-rose-100/90 leading-relaxed font-light">
            Crie orçamentos detalhados com PDF e envio direto por WhatsApp, e disponibilize links personalizados para que seus convidados confirmem presença com facilidade.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onNewBudget}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#882C4E] hover:bg-rose-50 rounded-xl text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Orçamento</span>
            </button>
            <button
              onClick={onNewEvent}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Cadastrar Evento & Lista RSVP</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Orçado</span>
            <div className="p-2.5 bg-rose-50 rounded-xl text-[#882C4E]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900">{formatCurrency(totalBudgetsValue)}</div>
            <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <span className="text-[#882C4E] font-medium">{budgets.length} propostas</span> registradas
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Fechados / Aprovados</span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(approvedValue)}</div>
            <div className="text-xs text-stone-500 mt-1">
              <span className="text-emerald-600 font-medium">{approvedBudgets.length} contratos</span> confirmados
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Eventos Ativos</span>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900">{events.length}</div>
            <div className="text-xs text-stone-500 mt-1">
              Casamentos e 15 anos com RSVP
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Convidados Confirmados</span>
            <div className="p-2.5 bg-rose-50 rounded-xl text-[#882C4E]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#882C4E]">{confirmedGuestsCount} <span className="text-sm font-normal text-stone-400">pessoas</span></div>
            <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
              <span>{pendingGuestsCount} aguardando resposta</span>
              <span className="font-semibold text-stone-600">Total: {totalGuests}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Budgets & Active RSVP Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Budgets */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#882C4E]" />
                <span>Últimos Orçamentos</span>
              </h2>
              <p className="text-xs text-stone-500">Propostas comerciais geradas para clientes</p>
            </div>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs font-semibold text-[#882C4E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100 mt-2 flex-1">
            {budgets.slice(0, 4).map(budget => (
              <div key={budget.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-sm">{budget.clientName}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      budget.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' :
                      budget.status === 'Enviado' ? 'bg-sky-100 text-sky-800' :
                      budget.status === 'Fechado' ? 'bg-purple-100 text-purple-800' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {budget.status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="text-[#882C4E] font-medium">{budget.eventType}</span>
                    <span>•</span>
                    <span>Data: {formatDate(budget.eventDate)}</span>
                    <span>•</span>
                    <span className="font-semibold text-stone-800">{formatCurrency(budget.total)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => onViewBudget(budget)}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg text-xs transition cursor-pointer"
                    title="Visualizar Proposta"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => onDownloadBudgetPdf(budget)}
                    className="p-2 text-[#882C4E] hover:bg-rose-50 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer font-medium"
                    title="Baixar PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => onSendBudgetWhatsapp(budget)}
                    className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer font-medium"
                    title="Enviar via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-auto border-t border-stone-100">
            <button
              onClick={onNewBudget}
              className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-[#882C4E] rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Elaborar Novo Orçamento</span>
            </button>
          </div>
        </div>

        {/* Active RSVP Events */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#882C4E]" />
                <span>Eventos & Confirmação de Presença</span>
              </h2>
              <p className="text-xs text-stone-500">Listas nominais e links de confirmação para convidados</p>
            </div>
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs font-semibold text-[#882C4E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100 mt-2 flex-1">
            {events.slice(0, 3).map(event => {
              const confirmed = event.guests.filter(g => g.status === 'confirmed').length;
              const total = event.guests.length;
              const percent = total > 0 ? Math.round((confirmed / total) * 100) : 0;

              return (
                <div key={event.id} className="py-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-stone-900 text-sm">{event.title}</h3>
                      <div className="text-xs text-stone-500 mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-stone-600">
                          <Clock className="w-3 h-3" />
                          {formatDate(event.eventDate)} às {event.eventTime}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-stone-600">
                          <MapPin className="w-3 h-3" />
                          {event.locationName}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-rose-50 text-[#882C4E] text-xs font-bold rounded-lg shrink-0">
                      {percent}% confirmado
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#882C4E] to-[#B85C7D] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-stone-500">
                      <b>{confirmed}</b> de <b>{total}</b> convites confirmados
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onShareEvent(event)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg font-medium transition cursor-pointer"
                        title="Gerar Link do Convite"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Link Convite</span>
                      </button>
                      <button
                        onClick={() => onOpenEventGuests(event)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-lg font-medium transition cursor-pointer shadow-2xs"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Ver Lista ({total})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 mt-auto border-t border-stone-100">
            <button
              onClick={onNewEvent}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Evento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
