import React, { useState } from 'react';
import { Budget, BudgetStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/pdfGenerator';
import { 
  Plus, Search, Download, MessageCircle, Eye, Edit2, Trash2, 
  Calendar, MapPin, Users, Filter, CheckCircle2, AlertCircle
} from 'lucide-react';

interface BudgetListProps {
  budgets: Budget[];
  onNewBudget: () => void;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  onViewBudget: (budget: Budget) => void;
  onDownloadPdf: (budget: Budget) => void;
  onSendWhatsapp: (budget: Budget) => void;
  onUpdateStatus: (id: string, status: BudgetStatus) => void;
}

export const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  onNewBudget,
  onEditBudget,
  onDeleteBudget,
  onViewBudget,
  onDownloadPdf,
  onSendWhatsapp,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = 
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.clientPhone && b.clientPhone.includes(searchTerm)) ||
      (b.eventLocation && b.eventLocation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesType = eventTypeFilter === 'all' || b.eventType === eventTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Fechado':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Enviado':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Cancelado':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Orçamentos & Propostas Comerciais
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Gere orçamentos formais em PDF com design elegante do Cerimonial Amor Perfeito ou envie direto no WhatsApp do cliente.
          </p>
        </div>

        <button
          onClick={onNewBudget}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#882C4E] hover:bg-[#732240] text-white rounded-2xl text-sm font-semibold shadow-md hover:shadow-lg transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Orçamento</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, código (AP-2026-...) ou local..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30 focus:border-[#882C4E]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 w-1/2 md:w-auto">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
            >
              <option value="all">Todos os Status</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Enviado">Enviado</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Fechado">Fechado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="w-1/2 md:w-auto">
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
            >
              <option value="all">Todos os Tipos</option>
              <option value="Casamento">Casamento</option>
              <option value="Aniversário de 15 Anos">15 Anos</option>
              <option value="Bodas">Bodas</option>
              <option value="Formatura">Formatura</option>
              <option value="Corporativo">Corporativo</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Budgets Grid / List */}
      {filteredBudgets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200">
          <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-700">Nenhum orçamento encontrado</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            {searchTerm || statusFilter !== 'all' || eventTypeFilter !== 'all'
              ? 'Tente ajustar os filtros ou os termos da busca.'
              : 'Comece criando a primeira proposta comercial para seu cliente.'}
          </p>
          <button
            onClick={onNewBudget}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-[#882C4E] text-white rounded-xl text-xs font-medium hover:bg-[#732240] transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Orçamento</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBudgets.map(budget => (
            <div
              key={budget.id}
              className="bg-white rounded-3xl border border-stone-200/90 hover:border-rose-300 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-stone-100 bg-gradient-to-b from-stone-50/70 to-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg">
                    {budget.code}
                  </span>
                  
                  {/* Status Dropdown */}
                  <select
                    value={budget.status}
                    onChange={(e) => onUpdateStatus(budget.id, e.target.value as BudgetStatus)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(budget.status)}`}
                  >
                    <option value="Rascunho">Rascunho</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Fechado">Fechado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <h3 className="font-serif font-bold text-base text-stone-900 mt-3 line-clamp-1">
                  {budget.clientName}
                </h3>
                <div className="inline-block mt-0.5 text-xs text-[#882C4E] font-medium">
                  {budget.eventType}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-2.5 text-xs text-stone-600 flex-1">
                <div className="flex items-center gap-2 text-stone-600">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Data: <b>{formatDate(budget.eventDate)}</b></span>
                </div>

                <div className="flex items-center gap-2 text-stone-600">
                  <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Aprox. <b>{budget.estimatedGuests}</b> convidados</span>
                </div>

                {budget.eventLocation && (
                  <div className="flex items-start gap-2 text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{budget.eventLocation}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-stone-500">{budget.items.length} itens incluídos</span>
                  <div className="text-right">
                    <div className="text-base font-bold text-stone-900">{formatCurrency(budget.total)}</div>
                    {budget.discount > 0 && (
                      <div className="text-[10px] text-emerald-600 font-medium">
                        desc. {formatCurrency(budget.discount)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => onViewBudget(budget)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2 text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl text-xs font-medium transition cursor-pointer"
                  title="Visualizar Proposta na Tela"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDownloadPdf(budget)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2 text-[#882C4E] hover:bg-rose-100/70 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Baixar em PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSendWhatsapp(budget)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2 text-emerald-700 hover:bg-emerald-100/70 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Enviar mensagem personalizada no WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <div className="flex items-center gap-0.5 pl-1 border-l border-stone-200">
                  <button
                    type="button"
                    onClick={() => onEditBudget(budget)}
                    className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition cursor-pointer"
                    title="Editar orçamento"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteBudget(budget.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Excluir orçamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
