import React, { useState, useEffect } from 'react';
import { Budget, BudgetItem, BudgetStatus, ServicePackage } from '../../types';
import { X, Plus, Trash2, Sparkles, Calculator, AlertTriangle, Package } from 'lucide-react';
import { formatCurrency } from '../../utils/pdfGenerator';
import { Storage } from '../../utils/storage';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Budget) => void;
  initialBudget?: Budget | null;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBudget,
}) => {
  if (!isOpen) return null;

  const settings = Storage.getSettings();
  const [packages, setPackages] = useState<ServicePackage[]>([]);

  useEffect(() => {
    setPackages(Storage.getPackages());
  }, [isOpen]);

  const [clientName, setClientName] = useState(initialBudget?.clientName || '');
  const [clientPhone, setClientPhone] = useState(initialBudget?.clientPhone || '');
  const [clientEmail, setClientEmail] = useState(initialBudget?.clientEmail || '');
  const [eventType, setEventType] = useState(initialBudget?.eventType || 'Casamento');
  const [eventDate, setEventDate] = useState(initialBudget?.eventDate || '');
  const [eventLocation, setEventLocation] = useState(initialBudget?.eventLocation || '');
  const [estimatedGuests, setEstimatedGuests] = useState(initialBudget?.estimatedGuests || 150);
  const [creatorName, setCreatorName] = useState(
    initialBudget?.creatorName || settings.responsibleName || ''
  );

  // Expiration & Auto-Delete
  const [autoDeleteOnExpiry, setAutoDeleteOnExpiry] = useState<boolean>(
    initialBudget?.autoDeleteOnExpiry ?? false
  );
  const [validityDays, setValidityDays] = useState<number>(
    initialBudget?.validityDays || 7
  );

  const calculateValidUntilDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [validUntil, setValidUntil] = useState(
    initialBudget?.validUntil || calculateValidUntilDate(7)
  );

  const [status, setStatus] = useState<BudgetStatus>(initialBudget?.status || 'Rascunho');
  const [paymentTerms, setPaymentTerms] = useState(
    initialBudget?.paymentTerms ||
      'Entrada de 30% na assinatura do contrato via PIX + saldo parcelado em até 10 dias antes do evento.'
  );
  const [notes, setNotes] = useState(initialBudget?.notes || '');
  const [discount, setDiscount] = useState<number>(initialBudget?.discount || 0);

  const [items, setItems] = useState<BudgetItem[]>(
    initialBudget?.items || [
      {
        id: 'item-1',
        name: 'Assessoria Completa e Cerimonial do Dia',
        description: 'Gestão integral do evento, cronograma, alinhamento com fornecedores e equipe dedicada.',
        category: 'Assessoria',
        quantity: 1,
        unitPrice: 5000,
        total: 5000,
      }
    ]
  );

  const handleAddPackage = (pkg: ServicePackage) => {
    const newItem: BudgetItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      name: pkg.name,
      description: pkg.description,
      category: pkg.category,
      quantity: 1,
      unitPrice: pkg.price,
      total: pkg.price,
    };
    setItems([...items, newItem]);
  };

  const handleAddCustomItem = () => {
    const newItem: BudgetItem = {
      id: `item-${Date.now()}`,
      name: 'Novo Serviço de Cerimonial',
      description: 'Descrição detalhada do serviço prestado.',
      category: 'Cerimonial',
      quantity: 1,
      unitPrice: 1000,
      total: 1000,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setItems(
      items.map(it => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(value) : it.quantity;
          const price = field === 'unitPrice' ? Number(value) : it.unitPrice;
          updated.total = (qty || 0) * (price || 0);
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('O orçamento deve ter pelo menos 1 item.');
      return;
    }
    setItems(items.filter(it => it.id !== id));
  };

  const subtotal = items.reduce((acc, it) => acc + (it.total || 0), 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }
    if (!creatorName.trim()) {
      alert('Por favor, informe o nome de quem está fazendo o orçamento.');
      return;
    }

    const randomCode = Math.floor(100 + Math.random() * 900);
    const year = new Date().getFullYear();
    const code = initialBudget?.code || `AP-${year}-${randomCode}`;

    let expiresAt: string | undefined = undefined;
    if (autoDeleteOnExpiry) {
      const now = new Date();
      now.setDate(now.getDate() + Number(validityDays));
      expiresAt = now.toISOString();
    }

    const newBudget: Budget = {
      id: initialBudget?.id || `budget-${Date.now()}`,
      code,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      eventType: eventType as any,
      eventDate,
      eventLocation: eventLocation.trim(),
      estimatedGuests: Number(estimatedGuests) || 0,
      creatorName: creatorName.trim(),
      autoDeleteOnExpiry,
      validityDays: autoDeleteOnExpiry ? Number(validityDays) : undefined,
      expiresAt,
      items,
      subtotal,
      discount: Number(discount) || 0,
      total,
      paymentTerms: paymentTerms.trim(),
      validUntil,
      notes: notes.trim(),
      status,
      createdAt: initialBudget?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSave(newBudget);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#882C4E] to-[#B85C7D] text-white shrink-0">
          <div>
            <h2 className="text-lg font-serif font-bold">
              {initialBudget ? 'Editar Orçamento' : 'Novo Orçamento de Cerimonial'}
            </h2>
            <p className="text-xs text-rose-100 font-light">
              Preencha os dados do cliente, o responsável e os pacotes de serviços
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section: Client & Event */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#882C4E] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dados do Cliente & Cerimônia</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do(s) Cliente(s) / Noivos *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Amanda Lima & Lucas Albuquerque"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tipo de Evento *
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                >
                  <option value="Casamento">Casamento</option>
                  <option value="Aniversário de 15 Anos">Aniversário de 15 Anos</option>
                  <option value="Bodas">Bodas</option>
                  <option value="Formatura">Formatura</option>
                  <option value="Corporativo">Corporativo</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Telefone / WhatsApp do Cliente
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-mail do Cliente
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Data Prevista do Evento
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Local Previsto / Cidade
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Ex: Espaço Villa Bisutti - São Paulo / SP"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Estimativa de Convidados
                </label>
                <input
                  type="number"
                  min="1"
                  value={estimatedGuests}
                  onChange={(e) => setEstimatedGuests(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                />
              </div>

              {/* Creator Name Field */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome de quem está fazendo o orçamento *
                </label>
                <input
                  type="text"
                  required
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Ex: Amanda Cerimonialista / Direção Amor Perfeito"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                />
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  Identifica o consultor ou cerimonialista responsável pela proposta.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Status Inicial
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                >
                  <option value="Rascunho">Rascunho</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Fechado">Fechado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Validade & Auto-Exclusão */}
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="autoDeleteExpiry"
                checked={autoDeleteOnExpiry}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAutoDeleteOnExpiry(checked);
                  if (checked) {
                    setValidUntil(calculateValidUntilDate(validityDays));
                  }
                }}
                className="mt-1 w-4 h-4 text-[#882C4E] rounded-md border-stone-300 focus:ring-[#882C4E] cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="autoDeleteExpiry" className="text-xs font-bold text-stone-800 cursor-pointer block">
                  Definir prazo de validade com auto-exclusão automática
                </label>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  Caso ativado, o orçamento será <b>excluído permanentemente do sistema</b> após o término da validade e não terá como recuperar, tendo que ser feito outro.
                </p>
              </div>
            </div>

            {autoDeleteOnExpiry && (
              <div className="pt-2 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Prazo de Validade (dias):
                  </label>
                  <select
                    value={validityDays}
                    onChange={(e) => {
                      const days = Number(e.target.value);
                      setValidityDays(days);
                      setValidUntil(calculateValidUntilDate(days));
                    }}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                  >
                    <option value={7}>7 dias (Recomendado)</option>
                    <option value={15}>15 dias</option>
                    <option value={30}>30 dias</option>
                    <option value={3}>3 dias (Urgente)</option>
                    <option value={1}>1 dia (Express)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Data Final de Validade:
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-900 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Após {validityDays} dias, este orçamento será excluído automaticamente e não terá como recuperar.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section: Items Table */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#882C4E] flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Itens & Serviços Inclusos</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Insira seus pacotes cadastrados ou crie itens sob medida
                </p>
              </div>

              {/* Quick Package Selector */}
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (selectedId) {
                      const found = packages.find(p => p.id === selectedId);
                      if (found) {
                        handleAddPackage(found);
                      }
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="bg-rose-50 text-[#882C4E] border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="" disabled>+ Incluir Pacote Cadastrado...</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({formatCurrency(pkg.price)})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Item Livre</span>
                </button>
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 bg-stone-50 border border-stone-200 rounded-2xl relative space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Título do Serviço #{index + 1}
                        </label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                          placeholder="Ex: Cerimonial do Dia"
                          className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#882C4E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Categoria
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="Cerimonial">Cerimonial</option>
                          <option value="Assessoria">Assessoria</option>
                          <option value="Coordenação">Coordenação</option>
                          <option value="Decoração">Decoração</option>
                          <option value="Música">Música</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer mt-5"
                      title="Remover serviço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Detalhamento do Escopo (aparecerá no PDF)
                    </label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      placeholder="Descreva o que está incluso neste serviço..."
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#882C4E]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Qtd.
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Valor Unitário (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Total do Item
                      </label>
                      <div className="px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-lg text-xs font-bold text-stone-800">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Discounts Calculation */}
            <div className="mt-4 p-4 bg-stone-100/70 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex items-center gap-3">
                <label className="text-xs font-semibold text-stone-700 whitespace-nowrap">
                  Desconto Especial (R$):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-32 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-rose-700 focus:outline-none"
                />
              </div>

              <div className="text-right w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6">
                <div>
                  <div className="text-[11px] text-stone-500">Subtotal: {formatCurrency(subtotal)}</div>
                  {discount > 0 && (
                    <div className="text-[11px] text-rose-600 font-medium">
                      Desconto: -{formatCurrency(discount)}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                    Valor Total da Proposta
                  </span>
                  <span className="text-xl font-extrabold text-[#882C4E]">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Payment Terms and Notes */}
          <div className="pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Forma & Condições de Pagamento
              </label>
              <textarea
                rows={3}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Ex: Entrada de 30% no ato do contrato + 4x parceladas até a data do evento..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Observações Especiais do Orçamento
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Proposta com desconto válido até o final do mês. Inclui brinde especial de ensaio."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-medium transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
            >
              Salvar Orçamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
