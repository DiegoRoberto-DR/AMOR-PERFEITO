import React, { useState } from 'react';
import { EventRsvp, Guest, RsvpStatus } from '../../types';
import { 
  X, Plus, Users, Search, MessageCircle, Trash2, CheckCircle2, 
  XCircle, Clock, FileDown, Upload, Utensils, Heart, Share2, Sparkles, FileText,
  Edit2, Phone, Save
} from 'lucide-react';
import { openGuestRsvpWhatsApp } from '../../utils/whatsapp';
import { generateGuestListPDF } from '../../utils/pdfGenerator';
import { Storage } from '../../utils/storage';

interface GuestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventRsvp | null;
  onUpdateEventGuests: (eventId: string, updatedGuests: Guest[]) => void;
  onOpenShareModal: (event: EventRsvp) => void;
}

export const GuestListModal: React.FC<GuestListModalProps> = ({
  isOpen,
  onClose,
  event,
  onUpdateEventGuests,
  onOpenShareModal,
}) => {
  if (!isOpen || !event) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Edit Guest Modal State
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Single Add State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'Família' | 'Padrinhos' | 'Amigos' | 'Trabalho' | 'Geral'>('Geral');
  const [tableNumber, setTableNumber] = useState('');
  const [maxCompanions, setMaxCompanions] = useState(1);

  // Bulk State
  const [bulkText, setBulkText] = useState('');
  const [bulkDefaultCompanions, setBulkDefaultCompanions] = useState(1);

  const guests = event.guests || [];

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGuest: Guest = {
      id: `g-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      phone: phone.trim(),
      category,
      tableNumber: tableNumber.trim(),
      maxCompanions: Number(maxCompanions) || 0,
      status: 'pending',
      confirmedCount: 0,
      companionNames: [],
      dietaryRestrictions: '',
      message: '',
    };

    const updated = [newGuest, ...guests];
    onUpdateEventGuests(event.id, updated);
    setName('');
    setPhone('');
    setTableNumber('');
    setShowAddForm(false);
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      alert('Por favor, cole ao menos um nome.');
      return;
    }

    const newGuests: Guest[] = lines.map((line, idx) => {
      let guestName = line;
      let guestPhone = '';

      if (line.includes(',')) {
        const parts = line.split(',');
        guestName = parts[0].trim();
        guestPhone = parts.slice(1).join(',').trim();
      } else if (line.includes(' - ')) {
        const parts = line.split(' - ');
        guestName = parts[0].trim();
        guestPhone = parts.slice(1).join(' - ').trim();
      }

      return {
        id: `g-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        name: guestName,
        phone: guestPhone,
        category: 'Geral',
        tableNumber: '',
        maxCompanions: Number(bulkDefaultCompanions) || 0,
        status: 'pending',
        confirmedCount: 0,
        companionNames: [],
        dietaryRestrictions: '',
        message: '',
      };
    });

    const updated = [...newGuests, ...guests];
    onUpdateEventGuests(event.id, updated);
    setBulkText('');
    setShowBulkImport(false);
  };

  const handleDeleteGuest = (guestId: string) => {
    if (confirm('Tem certeza que deseja remover este convidado da lista?')) {
      const updated = guests.filter(g => g.id !== guestId);
      onUpdateEventGuests(event.id, updated);
    }
  };

  const handleManualStatusToggle = (guestId: string, newStatus: RsvpStatus) => {
    const updated = guests.map(g => {
      if (g.id !== guestId) return g;
      const confirmedCount = newStatus === 'confirmed' ? (g.maxCompanions + 1) : 0;
      const companionNames = newStatus === 'confirmed' 
        ? (g.companionNames && g.companionNames.length > 0 ? g.companionNames : [g.name]) 
        : [];
      return {
        ...g,
        status: newStatus,
        confirmedCount,
        companionNames,
        confirmedAt: newStatus === 'confirmed' ? new Date().toLocaleString('pt-BR') : undefined
      };
    });
    onUpdateEventGuests(event.id, updated);
  };

  const handleSaveEditedGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;

    const updated = guests.map(g => (g.id === editingGuest.id ? editingGuest : g));
    onUpdateEventGuests(event.id, updated);
    setEditingGuest(null);
  };

  const filteredGuests = guests.filter(g => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.phone && g.phone.includes(searchTerm)) ||
      (g.companionNames && g.companionNames.some(cn => cn.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
  const totalPaxConfirmed = guests
    .filter(g => g.status === 'confirmed')
    .reduce((sum, g) => sum + (g.confirmedCount || 1), 0);
  const pendingCount = guests.filter(g => g.status === 'pending').length;
  const declinedCount = guests.filter(g => g.status === 'declined').length;

  const exportCSV = () => {
    const headers = ['Nome', 'Categoria', 'Mesa', 'Status', 'Qtd Confirmada', 'Acompanhantes', 'Restrições', 'Mensagem', 'Telefone'];
    const rows = guests.map(g => [
      `"${g.name}"`,
      `"${g.category || ''}"`,
      `"${g.tableNumber || ''}"`,
      `"${g.status}"`,
      g.confirmedCount || 0,
      `"${g.companionNames ? g.companionNames.join(', ') : ''}"`,
      `"${g.dietaryRestrictions || ''}"`,
      `"${(g.message || '').replace(/"/g, '""')}"`,
      `"${g.phone || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Lista_Convidados_${event.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRsvpBaseUrl = (guestId?: string) => {
    const origin = window.location.origin;
    if (guestId) {
      return `${origin}/?rsvp=${event.slug}&convidado=${guestId}`;
    }
    return `${origin}/?rsvp=${event.slug}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#882C4E] to-[#B85C7D] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg">{event.title}</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium border border-white/20">
                Lista Nominal para RSVP
              </span>
            </div>
            <p className="text-xs text-rose-100 font-light mt-0.5">
              Somente quem estiver nesta lista poderá confirmar presença. Como administrador, você pode alterar status manualmente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenShareModal(event)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Link do Convite</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{confirmedCount} confirmados ({totalPaxConfirmed} pessoas)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 font-medium">
              <Clock className="w-4 h-4" />
              <span>{pendingCount} pendentes</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-700 font-medium">
              <XCircle className="w-4 h-4" />
              <span>{declinedCount} recusados</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const settings = Storage.getSettings();
                generateGuestListPDF(event, settings);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Baixar lista em PDF para controle na portaria e recepção do evento"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lista PDF (Portaria)</span>
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-medium transition cursor-pointer"
              title="Baixar planilha CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowBulkImport(false);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Convidado</span>
            </button>

            <button
              onClick={() => {
                setShowBulkImport(!showBulkImport);
                setShowAddForm(false);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#882C4E] border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar em Lote</span>
            </button>
          </div>
        </div>

        {/* Toggle Form: Single Add */}
        {showAddForm && (
          <form onSubmit={handleAddSingle} className="p-5 bg-rose-50/50 border-b border-rose-200 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#882C4E]">
                Cadastrar Novo Convidado / Família
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Nome na Lista (ou Família) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo e Família"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="Família">Família</option>
                  <option value="Padrinhos">Padrinhos</option>
                  <option value="Amigos">Amigos</option>
                  <option value="Trabalho">Trabalho</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Acompanhantes
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxCompanions}
                  onChange={(e) => setMaxCompanions(Number(e.target.value))}
                  title="Número de acompanhantes além do titular (0 = individual)"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                Salvar Convidado
              </button>
            </div>
          </form>
        )}

        {/* Toggle Form: Bulk Import */}
        {showBulkImport && (
          <form onSubmit={handleBulkImport} className="p-5 bg-stone-100 border-b border-stone-200 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Importação Rápida em Lote (Cole sua lista)
                </h4>
                <p className="text-[11px] text-stone-500">
                  Cole um nome por linha (suporta formato "Nome, Telefone"). Eles serão adicionados instantaneamente à lista nominal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkImport(false)}
                className="text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <textarea
              rows={4}
              required
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Carlos Eduardo e Família, (11) 98765-4321&#10;Fernanda Lima & Convidado&#10;Mariana Souza, (11) 99123-4567&#10;Tio Roberto"
              className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <span>Acompanhantes por convite:</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={bulkDefaultCompanions}
                  onChange={(e) => setBulkDefaultCompanions(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                Importar Todos
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone ou acompanhante..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none"
            >
              <option value="all">Todos ({guests.length})</option>
              <option value="confirmed">Confirmados ({confirmedCount})</option>
              <option value="pending">Pendentes ({pendingCount})</option>
              <option value="declined">Recusados ({declinedCount})</option>
            </select>
          </div>
        </div>

        {/* Guest Table */}
        <div className="overflow-y-auto flex-1 p-4">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              Nenhum convidado encontrado nesta busca.
            </div>
          ) : (
            <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-stone-200 text-stone-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Convidado / Família</th>
                    <th className="py-3 px-3 text-center">Convite</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3">Detalhes da Confirmação</th>
                    <th className="py-3 px-4 text-right">Alteração Manual (Admin)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredGuests.map(guest => {
                    const rsvpLink = getRsvpBaseUrl(guest.id);

                    return (
                      <tr key={guest.id} className="hover:bg-rose-50/20 transition">
                        {/* Name and contacts */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900 text-sm">{guest.name}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                            {guest.category && (
                              <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-600 font-medium">
                                {guest.category}
                              </span>
                            )}
                            {guest.phone ? (
                              <span className="text-[#882C4E] font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200/50">
                                📱 {guest.phone}
                              </span>
                            ) : (
                              <span className="text-amber-600 text-[10px] italic">Sem telefone</span>
                            )}
                            {guest.tableNumber && <span>{guest.tableNumber}</span>}
                          </div>
                        </td>

                        {/* Max companions */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-semibold text-stone-700">
                            {guest.maxCompanions === 0
                              ? 'Individual'
                              : `Até +${guest.maxCompanions}`}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="py-3 px-3 text-center">
                          {guest.status === 'confirmed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{guest.confirmedCount} confirmado(s)</span>
                            </span>
                          ) : guest.status === 'declined' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-semibold text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Não irá</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold text-[11px]">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pendente</span>
                            </span>
                          )}
                        </td>

                        {/* Details confirmed */}
                        <td className="py-3 px-3 max-w-xs">
                          {guest.status === 'confirmed' ? (
                            <div className="space-y-1 text-[11px]">
                              {guest.companionNames && guest.companionNames.length > 0 && (
                                <div className="text-stone-700">
                                  <b>Presentes:</b> {guest.companionNames.join(', ')}
                                </div>
                              )}
                              {guest.dietaryRestrictions && (
                                <div className="text-amber-700 flex items-center gap-1">
                                  <Utensils className="w-3 h-3 shrink-0" />
                                  <span>{guest.dietaryRestrictions}</span>
                                </div>
                              )}
                              {guest.message && (
                                <div className="text-stone-500 italic bg-stone-50 p-1.5 rounded line-clamp-2">
                                  "{guest.message}"
                                </div>
                              )}
                              {guest.confirmedAt && (
                                <div className="text-[10px] text-stone-400">
                                  Registrado em {guest.confirmedAt}
                                </div>
                              )}
                            </div>
                          ) : guest.status === 'declined' ? (
                            <div className="space-y-1 text-[11px]">
                              <span className="text-rose-700 font-semibold">Ausência registrada</span>
                              {guest.message && (
                                <div className="text-stone-500 italic bg-stone-50 p-1.5 rounded">
                                  "{guest.message}"
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">Aguardando resposta pelo link</span>
                          )}
                        </td>

                        {/* Actions (Admin manual control) */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* WhatsApp Direct Invite */}
                            <button
                              type="button"
                              onClick={() => openGuestRsvpWhatsApp(event, guest, rsvpLink)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition cursor-pointer"
                              title="Enviar convite com link pelo WhatsApp deste convidado"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            {/* Manual Confirm Switch - Only Admin has power to change */}
                            {guest.status !== 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => handleManualStatusToggle(guest.id, 'confirmed')}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition cursor-pointer text-[10px] font-bold"
                                title="Admin: Confirmar presença manualmente"
                              >
                                Sim
                              </button>
                            )}

                            {guest.status !== 'declined' && (
                              <button
                                type="button"
                                onClick={() => handleManualStatusToggle(guest.id, 'declined')}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition cursor-pointer text-[10px] font-bold"
                                title="Admin: Marcar que não vai manualmente"
                              >
                                Não
                              </button>
                            )}

                            {guest.status !== 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleManualStatusToggle(guest.id, 'pending')}
                                className="px-2 py-1 bg-stone-100 hover:bg-amber-50 text-stone-600 hover:text-amber-800 rounded-lg transition cursor-pointer text-[10px]"
                                title="Admin: Resetar resposta para pendente"
                              >
                                Resetar
                              </button>
                            )}

                            {/* Edit Guest Details Modal trigger */}
                            <button
                              type="button"
                              onClick={() => setEditingGuest({ ...guest })}
                              className="p-1.5 text-stone-500 hover:text-[#882C4E] hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Editar dados deste convidado"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Remover convidado da lista"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal to Edit Guest (Manual Admin Edit) */}
        {editingGuest && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h4 className="font-serif font-bold text-base text-stone-900">
                  Editar Convidado (Alteração pelo Administrador)
                </h4>
                <button
                  onClick={() => setEditingGuest(null)}
                  className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedGuest} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nome no Convite *</label>
                  <input
                    type="text"
                    required
                    value={editingGuest.name}
                    onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={editingGuest.phone || ''}
                      onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Status da Presença</label>
                    <select
                      value={editingGuest.status}
                      onChange={(e) => setEditingGuest({ ...editingGuest, status: e.target.value as RsvpStatus })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    >
                      <option value="pending">Pendente</option>
                      <option value="confirmed">Confirmado (Sim)</option>
                      <option value="declined">Recusado (Não)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Acompanhantes Permitidos</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editingGuest.maxCompanions}
                      onChange={(e) => setEditingGuest({ ...editingGuest, maxCompanions: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Pessoas Confirmadas</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editingGuest.confirmedCount || 0}
                      onChange={(e) => setEditingGuest({ ...editingGuest, confirmedCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Restrições Alimentares</label>
                  <input
                    type="text"
                    value={editingGuest.dietaryRestrictions || ''}
                    onChange={(e) => setEditingGuest({ ...editingGuest, dietaryRestrictions: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mensagem ou Observação</label>
                  <textarea
                    rows={2}
                    value={editingGuest.message || ''}
                    onChange={(e) => setEditingGuest({ ...editingGuest, message: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditingGuest(null)}
                    className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
