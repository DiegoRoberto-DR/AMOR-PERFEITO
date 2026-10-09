import React, { useState } from 'react';
import { EventRsvp, Guest, RsvpStatus } from '../../types';
import { formatDate, generateGuestListPDF } from '../../utils/pdfGenerator';
import { Storage } from '../../utils/storage';
import { 
  CheckCircle2, Clock, XCircle, Search, Filter, 
  Calendar, MapPin, Users, Phone, UserCheck, Edit2, 
  Trash2, Download, MessageSquare, AlertCircle, X,
  UserPlus, Sparkles, Check
} from 'lucide-react';

interface PresenceConfirmationsViewProps {
  events: EventRsvp[];
  onUpdateEventGuests: (eventId: string, guests: Guest[]) => void;
}

export const PresenceConfirmationsView: React.FC<PresenceConfirmationsViewProps> = ({
  events,
  onUpdateEventGuests,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [manualConfirmGuest, setManualConfirmGuest] = useState<{ eventId: string; guest: Guest } | null>(null);
  const [confirmCount, setConfirmCount] = useState<number>(1);
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  
  const [editingGuestData, setEditingGuestData] = useState<{ eventId: string; guest: Guest } | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCategory, setEditCategory] = useState<Guest['category']>('Geral');
  const [editTable, setEditTable] = useState('');
  const [editCanBring, setEditCanBring] = useState(false);
  const [editMaxCompanions, setEditMaxCompanions] = useState(0);

  // Flatten all guests with their event reference
  const allGuestEntries: Array<{ event: EventRsvp; guest: Guest }> = [];
  events.forEach(evt => {
    evt.guests.forEach(g => {
      allGuestEntries.push({ event: evt, guest: g });
    });
  });

  // Calculate statistics
  const totalGuests = allGuestEntries.length;
  const confirmedGuests = allGuestEntries.filter(e => e.guest.status === 'confirmed');
  const totalPeopleConfirmed = confirmedGuests.reduce((acc, e) => acc + (e.guest.confirmedCount || 1), 0);
  const pendingGuests = allGuestEntries.filter(e => e.guest.status === 'pending');
  const declinedGuests = allGuestEntries.filter(e => e.guest.status === 'declined');

  // Filter list
  const filteredEntries = allGuestEntries.filter(({ event, guest }) => {
    const matchesEvent = selectedEventId === 'all' || event.id === selectedEventId;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'confirmed' && guest.status === 'confirmed') ||
      (statusFilter === 'pending' && guest.status === 'pending') ||
      (statusFilter === 'declined' && guest.status === 'declined');

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      guest.name.toLowerCase().includes(term) ||
      (guest.phone && guest.phone.includes(term)) ||
      (guest.companionNames && guest.companionNames.some(c => c.toLowerCase().includes(term))) ||
      event.title.toLowerCase().includes(term);

    return matchesEvent && matchesStatus && matchesSearch;
  });

  // Open manual confirmation modal
  const handleOpenManualConfirm = (eventId: string, guest: Guest) => {
    setManualConfirmGuest({ eventId, guest });
    const initialCount = guest.confirmedCount || 1;
    setConfirmCount(initialCount);
    const initialNames = guest.companionNames && guest.companionNames.length > 0
      ? [...guest.companionNames]
      : (guest.canBringCompanions && guest.maxCompanions > 0 ? [guest.name] : [guest.name]);
    setCompanionNames(initialNames);
  };

  // Submit manual confirmation
  const handleSaveManualConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualConfirmGuest) return;

    const { eventId, guest } = manualConfirmGuest;
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;

    const finalNames = companionNames.filter(n => n && n.trim().length > 0);
    const updatedGuest: Guest = {
      ...guest,
      status: 'confirmed',
      confirmedCount: confirmCount,
      companionNames: finalNames.length > 0 ? finalNames : [guest.name],
      confirmedAt: new Date().toLocaleString('pt-BR'),
    };

    const updatedGuestList = targetEvent.guests.map(g => g.id === guest.id ? updatedGuest : g);
    onUpdateEventGuests(eventId, updatedGuestList);

    // Sync guest update with server & storage
    Storage.updateGuestRsvp(eventId, guest.id, updatedGuest);

    setManualConfirmGuest(null);
  };

  // Open edit modal
  const handleOpenEdit = (eventId: string, guest: Guest) => {
    setEditingGuestData({ eventId, guest });
    setEditName(guest.name);
    setEditPhone(guest.phone || '');
    setEditCategory(guest.category || 'Geral');
    setEditTable(guest.tableNumber || '');
    setEditCanBring(guest.canBringCompanions ?? (guest.maxCompanions > 0));
    setEditMaxCompanions(guest.maxCompanions || 0);
  };

  // Save edit guest
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuestData) return;
    if (!editName.trim()) {
      alert('Informe o nome do convidado.');
      return;
    }

    const { eventId, guest } = editingGuestData;
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;

    const maxComp = editCanBring ? Number(editMaxCompanions) : 0;
    const updatedGuest: Guest = {
      ...guest,
      name: editName.trim(),
      phone: editPhone.trim(),
      category: editCategory,
      tableNumber: editTable.trim(),
      canBringCompanions: editCanBring,
      maxCompanions: maxComp,
    };

    const updatedGuestList = targetEvent.guests.map(g => g.id === guest.id ? updatedGuest : g);
    onUpdateEventGuests(eventId, updatedGuestList);
    setEditingGuestData(null);
  };

  // Delete guest completely
  const handleDeleteGuest = (eventId: string, guestId: string, guestName: string) => {
    if (confirm(`Tem certeza que deseja excluir o convidado "${guestName}" deste evento?\n\nEle será removido completamente e não conseguirá mais confirmar presença pelo link.`)) {
      const targetEvent = events.find(e => e.id === eventId);
      if (!targetEvent) return;

      const updatedGuestList = targetEvent.guests.filter(g => g.id !== guestId);
      onUpdateEventGuests(eventId, updatedGuestList);
    }
  };

  // Set guest status to pending (reabrir convite)
  const handleResetToPending = (eventId: string, guest: Guest) => {
    if (confirm(`Deseja reabrir o convite de "${guest.name}" para "Falta Confirmar" (Pendente)?`)) {
      const targetEvent = events.find(e => e.id === eventId);
      if (!targetEvent) return;

      const updatedGuest: Guest = {
        ...guest,
        status: 'pending',
        confirmedCount: 0,
        companionNames: [],
        confirmedAt: undefined,
      };

      const updatedGuestList = targetEvent.guests.map(g => g.id === guest.id ? updatedGuest : g);
      onUpdateEventGuests(eventId, updatedGuestList);
      Storage.updateGuestRsvp(eventId, guest.id, updatedGuest);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-[#882C4E]" />
            <span>Confirmação de Presença</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Painel centralizado de controle: veja quem já confirmou, quem falta confirmar e o evento correspondente. Você pode confirmar presenças manualmente, editar ou excluir convidados.
          </p>
        </div>

        {events.length > 0 && selectedEventId !== 'all' && (
          <button
            onClick={() => {
              const evt = events.find(e => e.id === selectedEventId);
              if (evt) {
                generateGuestListPDF(evt, Storage.getSettings());
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Baixar PDF do Evento</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Total de Convidados
            </span>
            <div className="p-2 bg-stone-100 rounded-xl text-stone-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900">{totalGuests}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Distribuídos em {events.length} evento(s)
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Confirmados
            </span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700">{confirmedGuests.length}</div>
            <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">
              {totalPeopleConfirmed} pessoa(s) no total
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Falta Confirmar
            </span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-800">{pendingGuests.length}</div>
            <div className="text-[11px] text-amber-700 mt-0.5">
              Aguardando confirmação
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Recusados
            </span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-700">{declinedGuests.length}</div>
            <div className="text-[11px] text-rose-600 mt-0.5">
              Não comparecerão
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do convidado, acompanhante, telefone ou evento..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30 focus:border-[#882C4E]"
          />
        </div>

        {/* Filter by Event */}
        <div className="w-full md:w-auto">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
          >
            <option value="all">Todos os Eventos ({events.length})</option>
            {events.map(evt => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.guests.length} convidados)
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div className="w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
          >
            <option value="all">Todos os Status</option>
            <option value="confirmed">Confirmados ({confirmedGuests.length})</option>
            <option value="pending">Falta Confirmar ({pendingGuests.length})</option>
            <option value="declined">Recusados ({declinedGuests.length})</option>
          </select>
        </div>
      </div>

      {/* Guest List Grid */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200">
          <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-700">Nenhum convidado encontrado</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            {events.length === 0
              ? 'Nenhum evento com convidados cadastrado ainda.'
              : 'Nenhum convidado corresponde aos filtros ou à busca selecionada.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map(({ event, guest }) => {
            const isConfirmed = guest.status === 'confirmed';
            const isDeclined = guest.status === 'declined';
            const isPending = guest.status === 'pending';

            return (
              <div
                key={`${event.id}-${guest.id}`}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-2xs hover:shadow-sm ${
                  isConfirmed 
                    ? 'border-emerald-200 bg-emerald-50/15' 
                    : isDeclined 
                    ? 'border-rose-200 bg-rose-50/15' 
                    : 'border-stone-200 hover:border-amber-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Guest Info & Event Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-stone-900">
                        {guest.name}
                      </span>

                      {/* Status Badge */}
                      {isConfirmed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmado ({guest.confirmedCount || 1} pax)</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Falta Confirmar</span>
                        </span>
                      )}
                      {isDeclined && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Não comparecerá</span>
                        </span>
                      )}

                      {guest.category && (
                        <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md font-medium">
                          {guest.category}
                        </span>
                      )}

                      {guest.tableNumber && (
                        <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-[#882C4E] rounded-md font-medium">
                          Mesa: {guest.tableNumber}
                        </span>
                      )}
                    </div>

                    {/* Event Reference */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                      <span className="font-semibold text-[#882C4E] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Evento: {event.title}</span>
                      </span>
                      <span>•</span>
                      <span>Data: {formatDate(event.eventDate)} às {event.eventTime}</span>
                      <span>•</span>
                      <span className="text-stone-500">{event.locationName}</span>
                    </div>

                    {/* Companions and details */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                      {guest.phone && (
                        <span className="flex items-center gap-1 text-stone-600 font-mono">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{guest.phone}</span>
                        </span>
                      )}

                      <span>
                        Permissão de Acompanhantes:{' '}
                        <b>
                          {guest.canBringCompanions && guest.maxCompanions > 0
                            ? `Até ${guest.maxCompanions} acompanhante(s)`
                            : 'Individual (Sem acompanhante)'}
                        </b>
                      </span>

                      {isConfirmed && guest.confirmedAt && (
                        <span className="text-emerald-700 text-[11px]">
                          Registrado em: {guest.confirmedAt}
                        </span>
                      )}
                    </div>

                    {/* Confirmed Companion Names */}
                    {isConfirmed && guest.companionNames && guest.companionNames.length > 0 && (
                      <div className="pt-1.5 text-xs">
                        <span className="font-semibold text-stone-700">Nomes na lista: </span>
                        <span className="text-[#882C4E] font-medium">
                          {guest.companionNames.join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Message if present */}
                    {guest.message && (
                      <div className="text-xs italic text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200/80 inline-block mt-1">
                        "{guest.message}"
                      </div>
                    )}
                  </div>

                  {/* Right Column: Admin Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                    {/* Manual Confirmation Button */}
                    {!isConfirmed ? (
                      <button
                        onClick={() => handleOpenManualConfirm(event.id, guest)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
                        title="Confirmar presença deste convidado manualmente"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirmar Presença</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResetToPending(event.id, guest)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 rounded-xl text-xs font-medium transition cursor-pointer"
                        title="Reabrir confirmação (voltar para Falta Confirmar)"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Reabrir</span>
                      </button>
                    )}

                    {/* Edit Guest Button */}
                    <button
                      onClick={() => handleOpenEdit(event.id, guest)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition cursor-pointer"
                      title="Editar dados do convidado"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    {/* Delete Guest Button */}
                    <button
                      onClick={() => handleDeleteGuest(event.id, guest.id, guest.name)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Excluir convidado da lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Confirm Modal */}
      {manualConfirmGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg">Confirmar Presença Manualmente</h3>
              </div>
              <button
                onClick={() => setManualConfirmGuest(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualConfirm} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                <div>Convidado: <b>{manualConfirmGuest.guest.name}</b></div>
                <div className="text-stone-500">
                  Permissão cadastrada:{' '}
                  <b>
                    {manualConfirmGuest.guest.canBringCompanions && manualConfirmGuest.guest.maxCompanions > 0
                      ? `Até ${manualConfirmGuest.guest.maxCompanions} acompanhante(s)`
                      : 'Convite Individual (Sem acompanhante)'}
                  </b>
                </div>
              </div>

              {manualConfirmGuest.guest.canBringCompanions && manualConfirmGuest.guest.maxCompanions > 0 ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Total de Pessoas Confirmadas (Titular + Acompanhantes):
                    </label>
                    <select
                      value={confirmCount}
                      onChange={(e) => {
                        const count = Number(e.target.value);
                        setConfirmCount(count);
                        const names = [...companionNames];
                        while (names.length < count) {
                          names.push('');
                        }
                        setCompanionNames(names.slice(0, count));
                      }}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold focus:outline-none"
                    >
                      {Array.from({ length: manualConfirmGuest.guest.maxCompanions + 1 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'pessoa (apenas o titular)' : `pessoas (titular + ${num - 1} acompanhante${num - 1 > 1 ? 's' : ''})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <label className="block text-xs font-semibold text-stone-700">
                      Nomes das Pessoas Confirmadas:
                    </label>
                    {Array.from({ length: confirmCount }).map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 w-16 shrink-0 font-medium">
                          {index === 0 ? 'Titular:' : `Acomp. #${index}:`}
                        </span>
                        <input
                          type="text"
                          required
                          value={companionNames[index] ?? (index === 0 ? manualConfirmGuest.guest.name : '')}
                          onChange={(e) => {
                            const updated = [...companionNames];
                            updated[index] = e.target.value;
                            setCompanionNames(updated);
                          }}
                          placeholder={index === 0 ? manualConfirmGuest.guest.name : `Nome do acompanhante ${index}`}
                          className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                  Confirmando presença <b>individual de {manualConfirmGuest.guest.name}</b> (1 pessoa).
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                Após confirmar, a presença ficará travada como <b>Confirmada</b>. Caso o convidado acesse o link, ele verá a presença já registrada e não conseguirá alterar.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setManualConfirmGuest(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Confirmar Agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {editingGuestData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#882C4E] to-[#B85C7D] text-white shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg">Editar Convidado</h3>
              </div>
              <button
                onClick={() => setEditingGuestData(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do Convidado Titular *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Família">Família</option>
                    <option value="Padrinhos">Padrinhos</option>
                    <option value="Amigos">Amigos</option>
                    <option value="Trabalho">Trabalho</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mesa / Setor (Opcional)
                </label>
                <input
                  type="text"
                  value={editTable}
                  onChange={(e) => setEditTable(e.target.value)}
                  placeholder="Ex: Mesa 04, Setor VIP"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Companions Options */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={editCanBring}
                    onChange={(e) => {
                      setEditCanBring(e.target.checked);
                      if (!e.target.checked) setEditMaxCompanions(0);
                      else if (editMaxCompanions === 0) setEditMaxCompanions(1);
                    }}
                    className="w-4 h-4 text-[#882C4E] rounded-md"
                  />
                  <span>Autorizar este convidado a levar acompanhante(s)</span>
                </label>

                {editCanBring && (
                  <div className="pt-2 border-t border-stone-200 animate-in fade-in">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Quantas pessoas ele pode levar além dele?
                    </label>
                    <select
                      value={editMaxCompanions}
                      onChange={(e) => setEditMaxCompanions(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value={1}>1 acompanhante (+ titular = 2 pessoas)</option>
                      <option value={2}>2 acompanhantes (+ titular = 3 pessoas)</option>
                      <option value={3}>3 acompanhantes (+ titular = 4 pessoas)</option>
                      <option value={4}>4 acompanhantes (+ titular = 5 pessoas)</option>
                      <option value={5}>5 acompanhantes (+ titular = 6 pessoas)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingGuestData(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
