import React from 'react';
import { Budget, EventRsvp, CerimonialSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/pdfGenerator';
import { 
  FileText, CalendarCheck, TrendingUp,
  ArrowRight, CheckCircle2, Sparkles, Download, MessageCircle
} from 'lucide-react';

interface DashboardProps {
  budgets: Budget[];
  events: EventRsvp[];
  settings: CerimonialSettings;
  onNewBudget?: () => void;
  onNewEvent?: () => void;
  onViewBudget: (budget: Budget) => void;
  onDownloadBudgetPdf: (budget: Budget) => void;
  onSendBudgetWhatsapp: (budget: Budget) => void;
  onOpenEventGuests?: (event: EventRsvp) => void;
  onShareEvent?: (event: EventRsvp) => void;
  onNavigateTab: (tab: 'budgets' | 'events' | 'confirmations') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  budgets,
  events,
  onViewBudget,
  onDownloadBudgetPdf,
  onSendBudgetWhatsapp,
  onNavigateTab,
}) => {
  // Stats
  const totalBudgetsValue = budgets.reduce((acc, b) => acc + (b.total || 0), 0);
  const approvedBudgets = budgets.filter(b => b.status === 'Aprovado' || b.status === 'Fechado');
  const approvedValue = approvedBudgets.reduce((acc, b) => acc + (b.total || 0), 0);

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
            Gerencie orçamentos detalhados com PDF elegante e envio direto por WhatsApp, cadastre pacotes de serviços e acompanhe em tempo real a confirmação de presença dos convidados.
          </p>
        </div>
      </div>

      {/* KPI Cards: Total de Orçamentos | Fechados / Aprovados | Eventos Ativos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200/70 shadow-xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total de Orçamentos</span>
            <div className="p-2.5 bg-rose-50 rounded-xl text-[#882C4E]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-stone-900">{formatCurrency(totalBudgetsValue)}</div>
            <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <span className="text-[#882C4E] font-medium font-semibold">{budgets.length} propostas</span> registradas no sistema
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/70 shadow-xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Fechados / Aprovados</span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">{formatCurrency(approvedValue)}</div>
            <div className="text-xs text-stone-500 mt-1">
              <span className="text-emerald-600 font-semibold">{approvedBudgets.length} contratos</span> confirmados e aprovados
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/70 shadow-xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Eventos Ativos</span>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-stone-900">{events.length}</div>
            <div className="text-xs text-stone-500 mt-1">
              Casamentos, 15 anos e eventos com lista nominal
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Últimos Orçamentos */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
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

        <div className="divide-y divide-stone-100 mt-2">
          {budgets.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              Nenhum orçamento cadastrado ainda.
            </div>
          ) : (
            budgets.slice(0, 6).map(budget => (
              <div key={budget.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 px-3 -mx-3 rounded-2xl transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-sm">{budget.clientName}</span>
                    <span className="text-[11px] text-stone-400 font-mono">({budget.code})</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      budget.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' :
                      budget.status === 'Enviado' ? 'bg-sky-100 text-sky-800' :
                      budget.status === 'Fechado' ? 'bg-purple-100 text-purple-800' :
                      budget.status === 'Cancelado' ? 'bg-rose-100 text-rose-800' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {budget.status}
                    </span>
                    {budget.creatorName && (
                      <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                        Por: {budget.creatorName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[#882C4E] font-medium">{budget.eventType}</span>
                    <span>•</span>
                    <span>Data: {formatDate(budget.eventDate)}</span>
                    <span>•</span>
                    <span className="font-semibold text-stone-800">{formatCurrency(budget.total)}</span>
                    {budget.autoDeleteOnExpiry && budget.expiresAt && (
                      <>
                        <span>•</span>
                        <span className="text-amber-700 text-[11px]">
                          Válido até: {formatDate(budget.expiresAt.split('T')[0])}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onViewBudget(budget)}
                    className="px-3 py-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl text-xs transition cursor-pointer font-medium"
                    title="Visualizar Proposta"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => onDownloadBudgetPdf(budget)}
                    className="px-3 py-1.5 text-[#882C4E] hover:bg-rose-50 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer font-medium border border-rose-100"
                    title="Baixar PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar PDF</span>
                  </button>
                  <button
                    onClick={() => onSendBudgetWhatsapp(budget)}
                    className="px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer font-medium border border-emerald-100"
                    title="Enviar via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
