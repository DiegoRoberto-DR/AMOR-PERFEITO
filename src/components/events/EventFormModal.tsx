import React, { useState } from 'react';
import { EventRsvp, Guest } from '../../types';
import { X, Sparkles, Calendar, MapPin, Image as ImageIcon, Users, Plus, Trash2, Upload, Phone, CheckCircle2, User, UserCheck } from 'lucide-react';

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
  const [singleCategory, setSingleCategory] = useState<'Família' | 'Padrinhos' | 'Amigos' | 'Trabalho' | 'Geral'>('Geral');
  
  // Explicit companion rules: Can bring companions?
  const [singleCanBring, setSingleCanBring] = useState<boolean>(false);
  const [singleCompanions, setSingleCompanions] = useState<number>(1);

  const [bulkText, setBulkText] = useState('');
  const [bulkCanBring, setBulkCanBring] = useState<boolean>(false);
  const [bulkCompanions, setBulkCompanions] = useState<number>(1);
  const [activeGuestTab, setActiveGuestTab] = useState<'bulk' | 'single'>('single');

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
      deadlineDate ? setDeadlineDate(initialEvent.deadlineDate || '') : setDeadlineDate(initialEvent.deadlineDate || '');
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

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleAddSingleGuest = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!singleName.trim()) {
      alert('Por favor, informe o nome do convidado.');
      return;
    }

    const companionsAllowed = singleCanBring ? Number(singleCompanions) || 1 : 0;

    const newGuest: Guest = {
      id: `g-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: singleName.trim(),
      phone: singlePhone.trim(),
      category: singleCategory,
      canBringCompanions: singleCanBring,
      maxCompanions: companionsAllowed,
      status: 'pending',
      confirmedCount: 0,
      companionNames: [],
      dietaryRestrictions: '',
      message: '',
    };

    setGuests([...guests, newGuest]);
    setSingleName('');
    setSinglePhone('');
    // Keep companion selection ready for next
  };

  const handleImportBulkGuests = (e: React.MouseEvent) => {
    e.preventDefault();
    const lines = bulkText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      alert('Cole ao menos um nome para adicionar à lista.');
      return;
    }

    const companionsAllowed = bulkCanBring ? Number(bulkCompanions) || 1 : 0;

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
        canBringCompanions: bulkCanBring,
        maxCompanions: companionsAllowed,
        status: 'pending',
        confirmedCount: 0,
        companionNames: [],
        dietaryRestrictions: '',
        message: '',
      };
    });

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
              Configure as informações e monte a lista de convidados oficial diretamente neste formulário
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

          {/* SECTION 2: GUEST LIST SETUP WITH MANDATORY COMPANION RULES */}
          <div className="pt-4 border-t-2 border-rose-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#882C4E] flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>2. Lista de Convidados deste Evento ({guests.length} adicionados)</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Defina cada convidado e se ele tem direito a levar acompanhantes ou se é convite individual.
                </p>
              </div>

              {/* Toggle bulk vs single */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveGuestTab('single')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    activeGuestTab === 'single' ? 'bg-white text-[#882C4E] shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  Adicionar 1 por 1
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGuestTab('bulk')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    activeGuestTab === 'bulk' ? 'bg-white text-[#882C4E] shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  Colar Lista em Lote
                </button>
              </div>
            </div>

            {/* Single Add Box */}
            {activeGuestTab === 'single' ? (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Nome do Convidado / Titular do Convite *
                    </label>
                    <input
                      type="text"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                      placeholder="Ex: Carlos Alberto Ferreira"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#882C4E]" />
                      <span>Telefone (Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={singlePhone}
                      onChange={(e) => setSinglePhone(formatPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* MANDATORY COMPANION RULE SELECTOR */}
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2.5">
                  <label className="block text-[11px] font-bold text-stone-800">
                    Este convidado pode levar acompanhante(s)? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                        !singleCanBring
                          ? 'bg-rose-50/70 border-[#882C4E] text-[#882C4E] font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="singleCanBring"
                        checked={!singleCanBring}
                        onChange={() => {
                          setSingleCanBring(false);
                          setSingleCompanions(0);
                        }}
                        className="w-3.5 h-3.5 text-[#882C4E]"
                      />
                      <div>
                        <div className="text-xs">Não (Convite Individual)</div>
                        <div className="text-[10px] text-stone-500 font-normal">
                          Não poderá levar ninguém e nem digitar nomes adicionais
                        </div>
                      </div>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                        singleCanBring
                          ? 'bg-rose-50/70 border-[#882C4E] text-[#882C4E] font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="singleCanBring"
                        checked={singleCanBring}
                        onChange={() => {
                          setSingleCanBring(true);
                          if (singleCompanions === 0) setSingleCompanions(1);
                        }}
                        className="w-3.5 h-3.5 text-[#882C4E]"
                      />
                      <div>
                        <div className="text-xs">Sim (Pode levar acompanhantes)</div>
                        <div className="text-[10px] text-stone-500 font-normal">
                          Deverá confirmar o nome de cada acompanhante no RSVP
                        </div>
                      </div>
                    </label>
                  </div>

                  {singleCanBring && (
                    <div className="pt-2 border-t border-stone-100 space-y-1.5 animate-in fade-in">
                      <label className="block text-[11px] font-semibold text-stone-700">
                        Quantas pessoas ele pode levar além dele?
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setSingleCompanions(num)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              singleCompanions === num
                                ? 'bg-[#882C4E] text-white shadow-xs'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            +{num} {num === 1 ? 'pessoa' : 'pessoas'}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Total do convite: até <b>{singleCompanions + 1} pessoas</b> (1 titular + {singleCompanions} acompanhante{singleCompanions === 1 ? '' : 's'}).
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-stone-600 text-[11px]">Categoria:</span>
                    <select
                      value={singleCategory}
                      onChange={(e) => setSingleCategory(e.target.value as any)}
                      className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs"
                    >
                      <option value="Família">Família</option>
                      <option value="Padrinhos">Padrinhos</option>
                      <option value="Amigos">Amigos</option>
                      <option value="Trabalho">Trabalho</option>
                      <option value="Geral">Geral</option>
                    </select>
                  </div>

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
            ) : (
              /* Bulk Import Box */
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200/80 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700">
                    Cole os nomes dos convidados abaixo (um por linha):
                  </label>
                  <p className="text-[10px] text-stone-500">
                    Dica: Você pode colar apenas os nomes, ou no formato "Nome, Telefone" (ex: Carlos Alberto, (11) 98765-4321).
                  </p>
                </div>
                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Carlos Alberto Ferreira, (11) 98765-4321&#10;Fernanda Lima&#10;Marcelo Ribeiro, (11) 99123-4567&#10;Mariana Souza"
                  className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:outline-none"
                />

                <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2">
                  <div className="text-[11px] font-bold text-stone-800">
                    Estes convidados colados poderão levar acompanhantes?
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="radio"
                        name="bulkCanBring"
                        checked={!bulkCanBring}
                        onChange={() => {
                          setBulkCanBring(false);
                          setBulkCompanions(0);
                        }}
                        className="text-[#882C4E]"
                      />
                      <span>Não (Convites Individuais)</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="radio"
                        name="bulkCanBring"
                        checked={bulkCanBring}
                        onChange={() => {
                          setBulkCanBring(true);
                          if (bulkCompanions === 0) setBulkCompanions(1);
                        }}
                        className="text-[#882C4E]"
                      />
                      <span>Sim (Pode levar acompanhantes)</span>
                    </label>
                  </div>

                  {bulkCanBring && (
                    <div className="flex items-center gap-2 pt-1 text-xs text-stone-600">
                      <span>Acompanhantes por convite:</span>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setBulkCompanions(num)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            bulkCompanions === num
                              ? 'bg-[#882C4E] text-white shadow-xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          +{num}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
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
            )}

            {/* Added Guests Preview List */}
            {guests.length > 0 ? (
              <div className="mt-3 p-3 bg-white rounded-2xl border border-stone-200 max-h-52 overflow-y-auto space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-1 flex items-center justify-between">
                  <span>Convidados adicionados para este evento:</span>
                  <span className="text-[#882C4E] font-bold">{guests.length} cadastrados</span>
                </div>
                {guests.map((g, idx) => (
                  <div
                    key={g.id || idx}
                    className="p-2.5 bg-stone-50 hover:bg-stone-100/70 rounded-xl border border-stone-200/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-stone-800">{g.name}</span>
                      {g.phone && (
                        <span className="px-2 py-0.5 bg-rose-50 text-[#882C4E] border border-rose-200 rounded text-[10px]">
                          📱 {g.phone}
                        </span>
                      )}
                      {g.maxCompanions > 0 ? (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-semibold">
                          👥 Até +{g.maxCompanions} acompanhante{g.maxCompanions === 1 ? '' : 's'} (Total {g.maxCompanions + 1})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 border border-stone-200 rounded text-[10px] font-medium">
                          👤 Individual (Sem acompanhante)
                        </span>
                      )}
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
            ) : (
              <div className="mt-2 p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-center text-xs text-stone-500">
                Nenhum convidado adicionado ainda. Adicione acima para que os convidados consigam confirmar presença.
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
              className="px-6 py-2.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {initialEvent ? 'Salvar Alterações' : 'Criar Evento'} {guests.length > 0 && `com ${guests.length} convidados`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
