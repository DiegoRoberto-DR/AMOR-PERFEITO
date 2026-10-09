import React, { useState } from 'react';
import { EventRsvp, Guest } from '../../types';
import { X, Sparkles, Calendar, MapPin, Image as ImageIcon, Users, Plus, Trash2, Upload, Phone } from 'lucide-react';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventRsvp) => void;
  initialEvent?: EventRsvp | null;
}

const PRESET_BANNERS = [
  {
    label: 'Casamento Clássico (Flores Brancas)',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Casamento Romântico ao Ar Livre',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: '15 Anos / Festa Moderna Champagne',
    url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Mesa de Bolo & Iluminação de Velas',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80',
  }
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(initialEvent?.title || '');
  const [subtitle, setSubtitle] = useState(initialEvent?.subtitle || 'Celebrando o amor ao lado dos melhores amigos e familiares.');
  const [eventType, setEventType] = useState(initialEvent?.eventType || 'Casamento');
  const [eventDate, setEventDate] = useState(initialEvent?.eventDate || '');
  const [eventTime, setEventTime] = useState(initialEvent?.eventTime || '18:00');
  const [locationName, setLocationName] = useState(initialEvent?.locationName || '');
  const [locationAddress, setLocationAddress] = useState(initialEvent?.locationAddress || '');
  const [locationMapsUrl, setLocationMapsUrl] = useState(initialEvent?.locationMapsUrl || '');
  const [deadlineDate, setDeadlineDate] = useState(initialEvent?.deadlineDate || '');
  const [welcomeMessage, setWelcomeMessage] = useState(
    initialEvent?.welcomeMessage ||
      'É uma imensa honra e alegria celebrar este momento tão especial da nossa história com você. Por favor, confirme a presença da sua família até o prazo para organizarmos tudo com carinho.'
  );
  const [dressCode, setDressCode] = useState(initialEvent?.dressCode || 'Traje Passeio Completo / Social');
  const [bannerImage, setBannerImage] = useState(
    initialEvent?.bannerImage || PRESET_BANNERS[0].url
  );

  // Guest list state right during event creation/editing
  const [guests, setGuests] = useState<Guest[]>(initialEvent?.guests || []);
  const [singleName, setSingleName] = useState('');
  const [singlePhone, setSinglePhone] = useState('');
  const [singleCompanions, setSingleCompanions] = useState(1);
  const [bulkText, setBulkText] = useState('');
  const [bulkCompanions, setBulkCompanions] = useState(1);
  const [activeGuestTab, setActiveGuestTab] = useState<'bulk' | 'single'>('bulk');

  React.useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || '');
      setSubtitle(initialEvent.subtitle || '');
      setEventType(initialEvent.eventType || 'Casamento');
      setEventDate(initialEvent.eventDate || '');
      setEventTime(initialEvent.eventTime || '18:00');
      setLocationName(initialEvent.locationName || '');
      setLocationAddress(initialEvent.locationAddress || '');
      setLocationMapsUrl(initialEvent.locationMapsUrl || '');
      setDeadlineDate(initialEvent.deadlineDate || '');
      setWelcomeMessage(initialEvent.welcomeMessage || '');
      setDressCode(initialEvent.dressCode || 'Traje Passeio Completo / Social');
      setBannerImage(initialEvent.bannerImage || PRESET_BANNERS[0].url);
      setGuests(initialEvent.guests || []);
    } else {
      setTitle('');
      setSubtitle('Celebrando o amor ao lado dos melhores amigos e familiares.');
      setEventType('Casamento');
      setEventDate('');
      setEventTime('18:00');
      setLocationName('');
      setLocationAddress('');
      setLocationMapsUrl('');
      setDeadlineDate('');
      setWelcomeMessage(
        'É uma imensa honra e alegria celebrar este momento tão especial da nossa história com você. Por favor, confirme a presença da sua família até o prazo para organizarmos tudo com carinho.'
      );
      setDressCode('Traje Passeio Completo / Social');
      setBannerImage(PRESET_BANNERS[0].url);
      setGuests([]);
    }
  }, [initialEvent, isOpen]);

  const handleAddSingleGuest = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!singleName.trim()) {
      alert('Por favor, informe o nome do convidado.');
      return;
    }

    const newGuest: Guest = {
      id: `g-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: singleName.trim(),
      phone: singlePhone.trim(),
      category: 'Geral',
      maxCompanions: Number(singleCompanions) || 0,
      status: 'pending',
      confirmedCount: 0,
      companionNames: [],
      dietaryRestrictions: '',
      message: '',
    };

    setGuests([...guests, newGuest]);
    setSingleName('');
    setSinglePhone('');
  };

  const handleImportBulkGuests = (e: React.MouseEvent) => {
    e.preventDefault();
    const lines = bulkText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      alert('Cole ao menos um nome para adicionar.');
      return;
    }

    const newGuests: Guest[] = lines.map((name, idx) => ({
      id: `g-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      name,
      phone: '',
      category: 'Geral',
      maxCompanions: Number(bulkCompanions) || 0,
      status: 'pending',
      confirmedCount: 0,
      companionNames: [],
      dietaryRestrictions: '',
      message: '',
    }));

    setGuests([...guests, ...newGuests]);
    setBulkText('');
  };

  const handleRemoveGuest = (id: string) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor, informe o título do evento.');
      return;
    }

    const slug = initialEvent?.slug || `${generateSlug(title)}-${Math.floor(100 + Math.random() * 900)}`;

    const savedEvent: EventRsvp = {
      id: initialEvent?.id || `event-${Date.now()}`,
      slug,
      title: title.trim(),
      subtitle: subtitle.trim(),
      eventType,
      eventDate,
      eventTime,
      locationName: locationName.trim(),
      locationAddress: locationAddress.trim(),
      locationMapsUrl: locationMapsUrl.trim(),
      deadlineDate,
      welcomeMessage: welcomeMessage.trim(),
      dressCode: dressCode.trim(),
      bannerImage,
      guests,
      createdAt: initialEvent?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSave(savedEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#882C4E] to-[#B85C7D] text-white shrink-0">
          <div>
            <h2 className="text-lg font-serif font-bold">
              {initialEvent ? 'Editar Evento' : 'Cadastrar Novo Evento'}
            </h2>
            <p className="text-xs text-rose-100 font-light">
              Configure as informações e crie a lista de convidados oficial deste evento
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* SECTION 1: Event Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#882C4E] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Informações Básicas do Evento</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Casamento de Amanda & Guilherme"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tipo de Evento *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                  >
                    <option value="Casamento">Casamento</option>
                    <option value="Aniversário de 15 Anos">Aniversário de 15 Anos</option>
                    <option value="Bodas">Bodas</option>
                    <option value="Formatura">Formatura</option>
                    <option value="Festa de Aniversário">Festa de Aniversário</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Subtítulo / Frase dos Anfitriões
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ex: O grande dia do nosso 'Sim'"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Horário de Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Prazo Limite para Confirmação *
                  </label>
                  <input
                    type="date"
                    required
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nome do Espaço / Buffet *
                  </label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Ex: Espaço Villa Bisutti"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Traje Recomendado
                  </label>
                  <input
                    type="text"
                    value={dressCode}
                    onChange={(e) => setDressCode(e.target.value)}
                    placeholder="Ex: Passeio Completo / Social"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Endereço Completo do Local
                </label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="Ex: Rua Casa do Ator, 642 - Vila Olímpia, São Paulo - SP"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mensagem de Boas-Vindas aos Convidados (RSVP)
                </label>
                <textarea
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: GUEST LIST SETUP (MANDATORY REQUIREMENT: CREATED DURING EVENT SETUP) */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#882C4E] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>2. Lista Nominal de Convidados ({guests.length} cadastrados)</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Os convidados só poderão confirmar presença caso seus nomes estejam nesta lista.
                </p>
              </div>

              {/* Toggle bulk vs single */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setActiveGuestTab('bulk')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    activeGuestTab === 'bulk' ? 'bg-white text-[#882C4E] shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  Colar Lista em Lote
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGuestTab('single')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    activeGuestTab === 'single' ? 'bg-white text-[#882C4E] shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  Adicionar 1 por 1
                </button>
              </div>
            </div>

            {/* Bulk Import Box */}
            {activeGuestTab === 'bulk' ? (
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200/80 space-y-3">
                <label className="block text-[11px] font-semibold text-stone-700">
                  Cole os nomes dos convidados abaixo (um nome ou família por linha):
                </label>
                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Carlos Alberto Ferreira & Família&#10;Fernanda Lima & Convidado&#10;Marcelo Ribeiro&#10;Mariana Souza"
                  className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <span>Acompanhantes permitidos por convite:</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={bulkCompanions}
                      onChange={(e) => setBulkCompanions(Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleImportBulkGuests}
                    className="px-4 py-2 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Adicionar Todos à Lista</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Single Add Box */
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Nome do Convidado / Família
                    </label>
                    <input
                      type="text"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                      placeholder="Ex: Carlos Alberto Ferreira & Família"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Acompanhantes permitidos
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={singleCompanions}
                      onChange={(e) => setSingleCompanions(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddSingleGuest}
                    className="px-4 py-2 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Convidado</span>
                  </button>
                </div>
              </div>
            )}

            {/* Added Guests Preview List */}
            {guests.length > 0 && (
              <div className="mt-3 p-3 bg-white rounded-2xl border border-stone-200 max-h-48 overflow-y-auto space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-1 flex items-center justify-between">
                  <span>Convidados Cadastrados para este evento:</span>
                  <span className="text-[#882C4E]">{guests.length} nomes</span>
                </div>
                {guests.map((g, idx) => (
                  <div
                    key={g.id || idx}
                    className="p-2 bg-stone-50 hover:bg-stone-100/70 rounded-xl border border-stone-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-stone-800">{g.name}</span>
                      <span className="text-[10px] text-stone-500 ml-2">
                        ({g.maxCompanions > 0 ? `Até ${g.maxCompanions + 1} pessoas` : 'Individual'})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGuest(g.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Remover este convidado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Banner selection */}
          <div className="pt-2 border-t border-stone-200">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#882C4E]" />
              <span>Foto de Capa do Evento</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {PRESET_BANNERS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setBannerImage(preset.url)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 h-16 transition ${
                    bannerImage === preset.url ? 'border-[#882C4E] ring-2 ring-rose-200' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-stone-900/70 text-[9px] text-white p-1 text-center truncate">
                    {preset.label}
                  </span>
                </div>
              ))}
            </div>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="Ou cole uma URL personalizada de imagem..."
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
            />
          </div>

          {/* Footer Submit */}
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
              Salvar Evento {guests.length > 0 && `(${guests.length} convidados)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
