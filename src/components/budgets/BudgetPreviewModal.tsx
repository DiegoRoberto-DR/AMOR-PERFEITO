import React from 'react';
import { Budget, CerimonialSettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/pdfGenerator';
import { X, Download, MessageCircle, Printer, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface BudgetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  settings: CerimonialSettings;
  onDownloadPdf: (budget: Budget) => void;
  onSendWhatsapp: (budget: Budget) => void;
}

export const BudgetPreviewModal: React.FC<BudgetPreviewModalProps> = ({
  isOpen,
  onClose,
  budget,
  settings,
  onDownloadPdf,
  onSendWhatsapp,
}) => {
  if (!isOpen || !budget) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-rose-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Top Control Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 text-sm sm:text-base">
              Proposta Comercial: {budget.code}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-[#882C4E] font-medium border border-rose-200">
              {budget.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadPdf(budget)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>

            <button
              onClick={() => onSendWhatsapp(budget)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable / Rendered Budget Document */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white mx-auto w-full max-w-3xl my-4 rounded-2xl shadow-sm border border-stone-200/60 print:border-none print:shadow-none print:my-0 print:p-0">
          {/* Header Box */}
          <div className="p-6 rounded-2xl bg-[#FAF6F3] border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#882C4E] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#882C4E] tracking-tight">
                  {settings.companyName}
                </h1>
                <p className="text-xs italic text-stone-500 mt-0.5">{settings.tagline}</p>
                <div className="text-[11px] text-stone-600 mt-2 space-y-0.5 font-light">
                  <p>WhatsApp: {settings.phone} • Instagram: {settings.instagram}</p>
                  <p>E-mail: {settings.email}</p>
                </div>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="inline-block px-3 py-1 bg-[#882C4E] text-white rounded-lg text-xs font-bold tracking-wider uppercase">
                Proposta Comercial
              </div>
              <div className="font-mono font-bold text-sm text-stone-900 mt-1">{budget.code}</div>
              <div className="text-[11px] text-stone-500 mt-1">Emissão: {formatDate(budget.createdAt)}</div>
              <div className="text-[11px] text-[#882C4E] font-medium">Validade: {formatDate(budget.validUntil)}</div>
              {budget.creatorName && (
                <div className="text-[11px] text-stone-600 mt-0.5">Elaborado por: <b>{budget.creatorName}</b></div>
              )}
            </div>
          </div>

          {/* Client & Event Info */}
          <div className="mt-6 p-5 rounded-2xl bg-stone-50/70 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                Informações do Cliente
              </span>
              <p className="font-bold text-sm text-stone-900">{budget.clientName}</p>
              <p className="text-stone-600 mt-0.5">WhatsApp: {budget.clientPhone || 'Não informado'}</p>
              {budget.clientEmail && <p className="text-stone-600">E-mail: {budget.clientEmail}</p>}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                Detalhes do Evento
              </span>
              <p className="font-bold text-sm text-[#882C4E]">
                {budget.eventType} ({budget.estimatedGuests} convidados)
              </p>
              <p className="text-stone-600 mt-0.5">Data Prevista: <b>{formatDate(budget.eventDate)}</b></p>
              <p className="text-stone-600">Local: {budget.eventLocation || 'A definir'}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#882C4E] mb-2">
              Especificação dos Serviços & Equipe
            </h3>
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#882C4E] text-white">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Serviço / Escopo</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Cat.</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Qtd</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Unitário</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {budget.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{item.name}</div>
                        {item.description && (
                          <div className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-stone-600 text-[11px]">{item.category}</td>
                      <td className="py-3 px-3 text-center text-stone-700 font-medium">{item.quantity}</td>
                      <td className="py-3 px-3 text-right text-stone-600">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 px-4 text-right font-bold text-stone-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary & Payment Terms */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Conditions */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <h4 className="font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Condições de Pagamento</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                {budget.paymentTerms || 'Consulte nossas opções de parcelamento.'}
              </p>
              {settings.pixKey && (
                <div className="mt-3 pt-2 border-t border-stone-200 text-[11px]">
                  <span className="font-semibold text-stone-700">Chave PIX:</span>{' '}
                  <span className="font-mono text-[#882C4E]">{settings.pixKey}</span>
                </div>
              )}
            </div>

            {/* Total Box */}
            <div className="p-4 rounded-xl bg-[#FAF6F3] border border-rose-200 flex flex-col justify-between text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(budget.subtotal)}</span>
                </div>
                {budget.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Desconto Especial:</span>
                    <span>- {formatCurrency(budget.discount)}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-rose-200/80 mt-2 flex justify-between items-baseline">
                <span className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                  Valor Total:
                </span>
                <span className="text-xl font-extrabold text-[#882C4E]">
                  {formatCurrency(budget.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-2">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
              Observações & Termos Gerais
            </h4>
            {budget.notes && (
              <p className="italic text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200/60">
                "{budget.notes}"
              </p>
            )}
            <p className="whitespace-pre-line text-stone-500 text-[10px] leading-relaxed">
              {settings.defaultTerms}
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-10 pt-6 border-t border-stone-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="w-48 mx-auto border-b border-stone-400 mb-1.5"></div>
              <p className="font-bold text-stone-800">{settings.companyName}</p>
              <p className="text-[10px] text-stone-500">Assessoria & Cerimonial</p>
            </div>
            <div>
              <div className="w-48 mx-auto border-b border-stone-400 mb-1.5"></div>
              <p className="font-bold text-stone-800">{budget.clientName}</p>
              <p className="text-[10px] text-stone-500">Contratante / Aceite da Proposta</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
