import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { EventRsvp, Guest, RsvpStatus } from '../../types';
import { formatDate } from '../../utils/pdfGenerator';
import { Storage, normalizeText } from '../../utils/storage';
import { decodeEventFromUrl } from '../../utils/urlSync';
import { 
  Heart, Calendar, Clock, MapPin, Search, CheckCircle2, 
  XCircle, Utensils, MessageSquare, Sparkles, AlertCircle, 
  ArrowLeft, ExternalLink, ShieldCheck, RefreshCw,
  Phone, Lock, User, Users, MessageCircle
} from 'lucide-react';

interface PublicRsvpViewProps {
  slug?: string;
  onBackToAdmin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const PublicRsvpView: React.FC<PublicRsvpViewProps> = ({
  slug,
  onBackToAdmin,
}) => {
  const [event, setEvent] = useState<EventRsvp | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState('');
  const [matchedGuests, setMatchedGuests] = useState<Guest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [attendance, setAttendance] = useState<'yes' | 'no'>('yes');
  const [guestPhone, setGuestPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [companionError, setCompanionError] = useState('');
  const [confirmedCount, setConfirmedCount] = useState<number>(1);
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [message, setMessage] = useState('');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  const formatPhoneInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  // Helper to prefill form or select guest
  const selectGuestForRsvp = (guest: Guest) => {
    setSelectedGuest(guest);
    setSearchQuery(guest.name);
    setGuestPhone(guest.phone || '');
    setPhoneError('');
    setCompanionError('');

    // If guest is still pending, initialize form defaults
    if (guest.status === 'pending') {
      setAttendance('yes');
      // If allowed companions > 0, default to 1 or max
      setConfirmedCount(1);
      setCompanionNames([guest.name]);
      setDietaryRestrictions('');
      setMessage('');
    }
  };

  const handlePerformSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchFeedback('');
    const query = searchQuery.trim();
    if (query.length < 3) {
      setSearchFeedback('Por favor, digite ao menos 3 letras do seu nome.');
      setMatchedGuests([]);
      setHasSearched(false);
      return;
    }

    const normQuery = normalizeText(query);
    const found = (event?.guests || []).filter(g => {
      const normName = normalizeText(g.name);
      return normName.includes(normQuery) || normQuery.includes(normName);
    });

    setHasSearched(true);
    setMatchedGuests(found);

    if (found.length === 1) {
      selectGuestForRsvp(found[0]);
    } else if (found.length === 0) {
      setSelectedGuest(null);
    }
  };

  // Load event and check for portable URL parameter & query parameters
  useEffect(() => {
    const loadEventData = async () => {
      setLoadError(null);

      // Sync with server first to clear any cached deleted events from the phone
      try {
        await Storage.syncWithServer();
      } catch {}

      // 1. Check query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hashQuery = window.location.hash.includes('?')
        ? window.location.hash.substring(window.location.hash.indexOf('?') + 1)
        : '';
      const hashParams = new URLSearchParams(hashQuery);
      
      const targetSlug = slug || urlParams.get('rsvp') || urlParams.get('evento') || hashParams.get('rsvp') || hashParams.get('evento');
      const targetGuestId = urlParams.get('convidado') || urlParams.get('guest') || urlParams.get('g') || hashParams.get('convidado');
      const portableData = urlParams.get('ed') || urlParams.get('d') || hashParams.get('ed') || hashParams.get('d');

      let currentEvent: EventRsvp | null = null;

      // 2. If portable event payload is in the URL, decode it immediately!
      if (portableData) {
        const decoded = decodeEventFromUrl(portableData);
        if (decoded) {
          Storage.saveEventFromUrl(decoded);
          currentEvent = decoded;
        }
      }

      // 3. Look in local storage by slug
      if (!currentEvent && targetSlug && targetSlug !== 'evento') {
        currentEvent = Storage.getEvents().find(e => 
          e.slug === targetSlug || 
          e.id === targetSlug ||
          normalizeText(e.slug) === normalizeText(targetSlug)
        ) || null;
      }

      // 4. Fallback to API if available
      if (!currentEvent && targetSlug && targetSlug !== 'evento') {
        try {
          const res = await fetch(`/api/events/${encodeURIComponent(targetSlug)}`);
          if (res.ok) {
            currentEvent = await res.json();
            if (currentEvent) Storage.saveEventFromUrl(currentEvent);
          }
        } catch {}
      }

      // 5. If no event was found yet or targetSlug was generic ('evento'), pick the latest active event
      if (!currentEvent) {
        const all = Storage.getEvents();
        if (all.length > 0) {
          currentEvent = all[0];
        }
      }

      if (currentEvent) {
        setEvent(currentEvent);

        // Pre-select guest if provided in URL
        if (targetGuestId) {
          const matchedGuest = currentEvent.guests.find(g => g.id === targetGuestId);
          if (matchedGuest) {
            selectGuestForRsvp(matchedGuest);
          }
        }
      } else {
        setLoadError(
          targetSlug && targetSlug !== 'evento'
            ? `O evento "${targetSlug}" não foi localizado ou foi excluído pelo cerimonial.`
            : 'Nenhum evento localizado no momento. Por favor, crie um evento no painel ou acesse o link enviado no convite.'
        );
      }
    };

    loadEventData();
  }, [slug]);

  // Listen for sync updates
  useEffect(() => {
    const handleUpdate = () => {
      if (!event) return;
      const refreshed = Storage.getEventBySlugOrId(event.slug);
      if (refreshed) {
        setEvent(refreshed);
        if (selectedGuest) {
          const updatedSelected = refreshed.guests.find(g => g.id === selectedGuest.id);
          if (updatedSelected) {
            setSelectedGuest(updatedSelected);
          }
        }
      }
    };

    window.addEventListener('amor_perfeito_data_updated', handleUpdate);
    return () => window.removeEventListener('amor_perfeito_data_updated', handleUpdate);
  }, [event, selectedGuest]);

  // Countdown calculation
  useEffect(() => {
    if (!event?.eventDate) return;

    const calculateTime = () => {
      const target = new Date(`${event.eventDate}T${event.eventTime || '18:00'}:00`).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [event]);

  const handleAttendanceChange = (val: 'yes' | 'no') => {
    setAttendance(val);
    setCompanionError('');
  };

  const handleCountChange = (count: number) => {
    setConfirmedCount(count);
    setCompanionError('');
    const current = [...companionNames];
    if (count > current.length) {
      while (current.length < count) {
        current.push('');
      }
    } else {
      current.splice(count);
    }
    setCompanionNames(current);
  };

  const handleCompanionNameChange = (idx: number, val: string) => {
    const updated = [...companionNames];
    updated[idx] = val;
    setCompanionNames(updated);
    setCompanionError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !selectedGuest) return;

    // Protection: If already confirmed or declined, do not allow submission
    if (selectedGuest.status === 'confirmed' || selectedGuest.status === 'declined') {
      alert('Sua resposta já foi registrada anteriormente e não pode mais ser alterada.');
      return;
    }

    // MANDATORY PHONE VALIDATION
    const cleanPhone = guestPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setPhoneError('O telefone com DDD é OBRIGATÓRIO (mínimo 10 dígitos) para confirmar sua presença e diferenciar seu convite caso haja outro convidado com nome igual.');
      return;
    }
    setPhoneError('');

    const isYes = attendance === 'yes';
    const status: RsvpStatus = isYes ? 'confirmed' : 'declined';
    
    // COMPANION VALIDATION
    const allowedCompanions = Number(selectedGuest.maxCompanions) || 0;
    let finalCount = 1;
    let finalNames: string[] = [selectedGuest.name];

    if (isYes) {
      if (allowedCompanions === 0) {
        // Individual invitation: only 1 person, no companions allowed
        finalCount = 1;
        finalNames = [selectedGuest.name];
      } else {
        // Can bring companions: check count and companion names
        finalCount = confirmedCount;
        finalNames = [selectedGuest.name];

        if (confirmedCount > 1) {
          for (let i = 1; i < confirmedCount; i++) {
            const name = (companionNames[i] || '').trim();
            if (!name) {
              setCompanionError(`Por favor, preencha o nome completo do ${i}º acompanhante que irá com você.`);
              return;
            }
            finalNames.push(name);
          }
        }
      }
    } else {
      finalCount = 0;
      finalNames = [];
    }

    setIsSubmitting(true);

    const updatedGuestData: Partial<Guest> = {
      status,
      phone: guestPhone.trim(),
      confirmedCount: finalCount,
      companionNames: finalNames,
      dietaryRestrictions: isYes ? dietaryRestrictions.trim() : '',
      message: message.trim(),
      confirmedAt: new Date().toLocaleString('pt-BR'),
    };

    // Update locally and remotely
    await Storage.updateGuestRsvp(event.id, selectedGuest.id, updatedGuestData);

    // Update in-memory state
    const updatedGuests = event.guests.map(g =>
      g.id === selectedGuest.id ? { ...g, ...updatedGuestData } : g
    );

    const updatedEvent = { ...event, guests: updatedGuests };
    setEvent(updatedEvent);
    
    // Set selectedGuest to the updated guest so the view immediately switches to locked mode
    const updatedTargetGuest: Guest = { ...selectedGuest, ...updatedGuestData };
    setSelectedGuest(updatedTargetGuest);

    // Trigger celebration
    if (isYes) {
      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#882C4E', '#B85C7D', '#D4AF37', '#FAD02C', '#E8A598'],
      });
    }

    setIsSubmitting(false);
  };

  const handleNotifyCerimonialWhatsApp = () => {
    if (!event || !selectedGuest) return;
    const settings = Storage.getSettings();
    const isYes = selectedGuest.status === 'confirmed';
    const pax = selectedGuest.confirmedCount || 1;
    const names = selectedGuest.companionNames?.join(', ') || selectedGuest.name;
    
    const text = isYes
      ? `Olá! Confirmei minha presença no evento *${event.title}* através do link oficial de RSVP!\n\n👤 *Titular:* ${selectedGuest.name}\n📱 *Telefone:* ${selectedGuest.phone || ''}\n🥂 *Presença:* Confirmada (${pax} pessoa${pax > 1 ? 's' : ''})\n👥 *Nomes:* ${names}${selectedGuest.dietaryRestrictions ? `\n🥗 *Restrições:* ${selectedGuest.dietaryRestrictions}` : ''}${selectedGuest.message ? `\n💌 *Mensagem:* "${selectedGuest.message}"` : ''}`
      : `Olá! Registrei minha resposta no evento *${event.title}* informando que infelizmente não poderei comparecer.\n\n👤 *Nome:* ${selectedGuest.name}\n💌 *Mensagem:* "${selectedGuest.message || 'Desejo muitas felicidades!'}"`;

    const phoneClean = (settings.whatsapp || settings.phone || '').replace(/\D/g, '');
    const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loadError || !event) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl text-center border border-rose-100 space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-[#882C4E] rounded-2xl flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7 fill-[#882C4E]" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-800">
            Cerimonial Amor Perfeito
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            {loadError || 'Carregando evento... Por favor, verifique o link do convite recebido.'}
          </p>
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="mt-4 px-5 py-2.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
            >
              Acessar Painel Administrativo
            </button>
          )}
        </div>
      </div>
    );
  }

  const allowedCompanions = Number(selectedGuest?.maxCompanions) || 0;
  const isIndividualOnly = allowedCompanions === 0;
  const isGuestLocked = selectedGuest && (selectedGuest.status === 'confirmed' || selectedGuest.status === 'declined');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 selection:bg-rose-200">
      {/* Top Admin Return Bar (if previewing from Admin) */}
      {onBackToAdmin && (
        <div className="bg-[#882C4E] text-white py-2 px-4 text-xs flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-300" />
            <span>Página Oficial de Confirmação do Convidado (RSVP)</span>
          </div>
          <button
            onClick={onBackToAdmin}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Painel Administrativo</span>
          </button>
        </div>
      )}

      {/* Hero Banner with Romantic Cover */}
      <div className="relative min-h-[360px] sm:min-h-[420px] flex items-center justify-center text-center p-6 text-white overflow-hidden">
        <img
          src={event.bannerImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80'}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.45]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-stone-900/60"></div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-4 pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-rose-100 border border-white/30">
            <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
            <span>Confirmação de Presença • Cerimonial Amor Perfeito</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white drop-shadow-md">
            {event.title}
          </h1>

          {event.subtitle && (
            <p className="text-base sm:text-lg text-rose-100/90 font-light italic max-w-lg mx-auto">
              "{event.subtitle}"
            </p>
          )}

          {/* Countdown Card */}
          {timeLeft && (
            <div className="pt-2 flex items-center justify-center gap-3 sm:gap-4 text-stone-900">
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md min-w-[64px] border border-rose-100">
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#882C4E]">{timeLeft.days}</div>
                <div className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">Dias</div>
              </div>
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md min-w-[64px] border border-rose-100">
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#882C4E]">{timeLeft.hours}</div>
                <div className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">Horas</div>
              </div>
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md min-w-[64px] border border-rose-100">
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#882C4E]">{timeLeft.minutes}</div>
                <div className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">Min</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-14 relative z-20 pb-20 space-y-8">
        {/* Event Quick Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-[#882C4E] mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Data do Evento</span>
            <span className="text-sm font-bold text-stone-800 mt-0.5">{formatDate(event.eventDate)}</span>
            <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-[#882C4E]" /> {event.eventTime}
            </span>
          </div>

          <div className="flex flex-col items-center sm:border-x sm:border-stone-100 sm:px-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-[#882C4E] mb-2">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Local da Celebração</span>
            <span className="text-sm font-bold text-stone-800 mt-0.5 line-clamp-1">{event.locationName}</span>
            <span className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{event.locationAddress}</span>
            {event.locationMapsUrl && (
              <a
                href={event.locationMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 text-xs text-[#882C4E] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Ver no Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-[#882C4E] mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Traje & Prazo</span>
            <span className="text-sm font-bold text-[#882C4E] mt-0.5">{event.dressCode || 'Passeio Completo'}</span>
            <span className="text-xs text-stone-500 mt-0.5">
              Confirmar até: <b>{formatDate(event.deadlineDate)}</b>
            </span>
          </div>
        </div>

        {/* Welcome Host Message */}
        {event.welcomeMessage && (
          <div className="bg-gradient-to-r from-rose-50/70 via-stone-50/80 to-rose-50/70 p-6 rounded-3xl border border-rose-100 text-center text-xs sm:text-sm text-stone-700 leading-relaxed font-serif italic">
            "{event.welcomeMessage}"
          </div>
        )}

        {/* RSVP Interactive Step Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100">
          <div className="text-center max-w-md mx-auto mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#882C4E] to-[#B85C7D] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Confirmar Minha Presença
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Localize seu nome na lista oficial dos anfitriões para confirmar ou recusar seu convite
            </p>
          </div>

          {/* Step 1: Search Name in the Registered Guest List */}
          <div className="space-y-4">
            <form onSubmit={handlePerformSearch} className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                1. Digite seu nome completo para localizar seu convite:
              </label>
              <p className="text-[11px] text-stone-500">
                Por segurança e privacidade, seu convite só aparecerá após você digitar seu nome correto cadastrado na lista.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHasSearched(false);
                      setSearchFeedback('');
                      if (selectedGuest && normalizeText(e.target.value) !== normalizeText(selectedGuest.name)) {
                        setSelectedGuest(null);
                      }
                    }}
                    placeholder="Ex: Carlos Alberto Ferreira..."
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30 focus:border-[#882C4E]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#882C4E] hover:bg-[#732240] text-white rounded-2xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                >
                  Localizar Convite
                </button>
              </div>
            </form>

            {searchFeedback && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{searchFeedback}</span>
              </div>
            )}

            {/* If searched and NOT found */}
            {hasSearched && matchedGuests.length === 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 text-center space-y-1">
                <p className="font-bold">Nome não localizado na lista oficial de convidados deste evento.</p>
                <p className="text-[11px] text-rose-600">
                  Verifique se você digitou seu nome completo conforme consta no convite ou entre em contato com os anfitriões / Cerimonial Amor Perfeito.
                </p>
              </div>
            )}

            {/* If searched and MULTIPLE matches */}
            {hasSearched && matchedGuests.length > 1 && !selectedGuest && (
              <div className="space-y-2 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <p className="text-xs font-bold text-stone-800">
                  Encontramos {matchedGuests.length} convites com este nome. Por favor, identifique qual é o seu convite:
                </p>
                <div className="space-y-2">
                  {matchedGuests.map(guest => {
                    const isAlreadyAnswered = guest.status === 'confirmed' || guest.status === 'declined';
                    return (
                      <div
                        key={guest.id}
                        className="p-3 bg-white rounded-xl border border-stone-200/80 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
                            <span>{guest.name}</span>
                            {guest.status === 'confirmed' && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-semibold">
                                Já confirmado
                              </span>
                            )}
                            {guest.status === 'declined' && (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-semibold">
                                Já informou que não vai
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-500 mt-0.5">
                            {guest.maxCompanions > 0 
                              ? `Convite com até ${guest.maxCompanions} acompanhante(s)` 
                              : 'Convite Individual (Sem acompanhante)'}
                            {guest.phone && ` • Telefone: ***${guest.phone.slice(-4)}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectGuestForRsvp(guest)}
                          className="px-3 py-1.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-lg text-xs font-bold cursor-pointer transition shrink-0"
                        >
                          {isAlreadyAnswered ? 'Ver Resposta' : 'Este é o Meu Convite'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* CASE A: GUEST ALREADY CONFIRMED OR DECLINED -> LOCKED VIEW   */}
            {/* ============================================================ */}
            {selectedGuest && isGuestLocked && (
              <div className="pt-6 border-t border-stone-100 space-y-6 animate-in fade-in">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-50 via-rose-50/40 to-stone-100 border-2 border-rose-200/90 text-stone-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/60">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        selectedGuest.status === 'confirmed' 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/10'
                          : 'bg-stone-600 text-white shadow-md'
                      }`}>
                        {selectedGuest.status === 'confirmed' ? (
                          <CheckCircle2 className="w-7 h-7" />
                        ) : (
                          <XCircle className="w-7 h-7" />
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#882C4E]">
                          Convite Localizado
                        </div>
                        <h3 className="text-lg font-bold text-stone-900">{selectedGuest.name}</h3>
                      </div>
                    </div>

                    <div>
                      {selectedGuest.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            Presença Confirmada ({selectedGuest.confirmedCount || 1} pessoa{selectedGuest.confirmedCount === 1 ? '' : 's'})
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-300">
                          <XCircle className="w-4 h-4" />
                          <span>Não comparecerá</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Registered Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/80 p-4 rounded-2xl border border-rose-100">
                    <div>
                      <span className="font-semibold text-stone-500 block text-[10px] uppercase">Telefone Identificador</span>
                      <span className="font-bold text-stone-800">{selectedGuest.phone || 'Cadastrado'}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-stone-500 block text-[10px] uppercase">Data do Registro</span>
                      <span className="font-bold text-stone-800">{selectedGuest.confirmedAt || 'Registrado no sistema'}</span>
                    </div>

                    {selectedGuest.status === 'confirmed' && (
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-stone-500 block text-[10px] uppercase">
                          {selectedGuest.maxCompanions > 0 ? 'Nomes Confirmados na Portaria' : 'Tipo de Convite'}
                        </span>
                        <span className="font-bold text-[#882C4E]">
                          {selectedGuest.companionNames && selectedGuest.companionNames.length > 0
                            ? selectedGuest.companionNames.join(', ')
                            : `${selectedGuest.name} (Convite Individual)`}
                        </span>
                      </div>
                    )}

                    {selectedGuest.status === 'confirmed' && selectedGuest.dietaryRestrictions && (
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-stone-500 block text-[10px] uppercase">Restrições Alimentares</span>
                        <span className="text-stone-700">{selectedGuest.dietaryRestrictions}</span>
                      </div>
                    )}

                    {selectedGuest.message && (
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-stone-500 block text-[10px] uppercase">Mensagem aos Anfitriões</span>
                        <span className="text-stone-700 italic">"{selectedGuest.message}"</span>
                      </div>
                    )}
                  </div>

                  {/* MANDATORY NOTICE: Locked, only Admin can alter */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Confirmação Finalizada e Bloqueada para Alterações</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800/90">
                      Por motivos de segurança e organização do cerimonial, após a confirmação ou recusa ter sido registrada, <b>não é mais possível alterar a resposta pelo site</b>.
                    </p>
                    <p className="text-[11px] font-semibold text-amber-950">
                      Caso necessite de qualquer retificação ou inclusão, entre em contato diretamente com os anfitriões ou com o <b>Cerimonial Amor Perfeito</b>. Apenas o Administrador pode efetuar alterações manualmente.
                    </p>
                  </div>

                  {/* Action Buttons: WhatsApp notification & Change Name */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleNotifyCerimonialWhatsApp}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Avisar Cerimonial no WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuest(null);
                        setSearchQuery('');
                        setHasSearched(false);
                      }}
                      className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold cursor-pointer transition shadow-2xs"
                    >
                      Consultar outro convite
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* CASE B: GUEST IS PENDING -> RENDER FORM TO CONFIRM PRESENCE   */}
            {/* ============================================================ */}
            {selectedGuest && !isGuestLocked && (
              <div className="pt-6 border-t border-stone-100 space-y-6 animate-in fade-in">
                {/* Guest Identity Banner */}
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">
                      Convite Selecionado
                    </span>
                    <h3 className="text-base font-bold text-stone-900">{selectedGuest.name}</h3>
                    
                    {/* Explicit Companion Rule Notice */}
                    {isIndividualOnly ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[11px] font-semibold mt-1 border border-stone-200">
                        <User className="w-3 h-3 text-stone-500" />
                        <span>Convite Individual (Válido exclusivamente para você)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[11px] font-semibold mt-1 border border-purple-200">
                        <Users className="w-3 h-3 text-purple-600" />
                        <span>Você pode levar até {allowedCompanions} acompanhante{allowedCompanions === 1 ? '' : 's'} (Total {allowedCompanions + 1} pessoas)</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuest(null);
                        setSearchQuery('');
                      }}
                      className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    >
                      Trocar nome
                    </button>
                  </div>
                </div>

                {/* Form to submit attendance */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 2: Attendance Choice */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                      2. Você comparecerá ao evento?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                          attendance === 'yes'
                            ? 'border-[#882C4E] bg-rose-50/40 text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="attendance"
                          value="yes"
                          checked={attendance === 'yes'}
                          onChange={() => handleAttendanceChange('yes')}
                          className="w-4 h-4 text-[#882C4E] focus:ring-[#882C4E]"
                        />
                        <div>
                          <div className="font-bold text-sm">Sim, estarei presente! 🥂</div>
                          <div className="text-[11px] text-stone-500">Contem comigo neste dia especial</div>
                        </div>
                      </label>

                      <label
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                          attendance === 'no'
                            ? 'border-stone-600 bg-stone-100 text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="attendance"
                          value="no"
                          checked={attendance === 'no'}
                          onChange={() => handleAttendanceChange('no')}
                          className="w-4 h-4 text-stone-600 focus:ring-stone-600"
                        />
                        <div>
                          <div className="font-bold text-sm">Infelizmente não poderei 💌</div>
                          <div className="text-[11px] text-stone-500">Estarei com vocês em pensamento</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Step 3: Mandatory Phone Number Field */}
                  <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-[#882C4E]" />
                        <span>Seu Telefone / WhatsApp com DDD (Obrigatório) *</span>
                      </span>
                      <span className="text-[10px] bg-rose-100 text-[#882C4E] font-semibold px-2 py-0.5 rounded">
                        Identificação única
                      </span>
                    </label>
                    <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
                      O preenchimento do seu telefone é <b>obrigatório</b> para diferenciar você caso haja outros convidados com nomes iguais ou parecidos na lista oficial dos anfitriões.
                    </p>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => {
                        setGuestPhone(formatPhoneInput(e.target.value));
                        setPhoneError('');
                      }}
                      placeholder="Ex: (11) 98765-4321"
                      className={`w-full px-3.5 py-2.5 bg-white border ${
                        phoneError ? 'border-rose-500 ring-2 ring-rose-200' : 'border-stone-300'
                      } rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30`}
                    />
                    {phoneError && (
                      <p className="text-xs text-rose-700 mt-1.5 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>

                  {/* Step 4: Companion Logic according to Admin authorization */}
                  {attendance === 'yes' && (
                    <div className="space-y-4">
                      {isIndividualOnly ? (
                        /* CASE 1: Individual only -> Guest cannot bring anyone and cannot enter companion names */
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                          <div className="flex items-center gap-2 font-bold text-xs text-stone-800">
                            <User className="w-4 h-4 text-[#882C4E]" />
                            <span>Confirmação Exclusiva para: {selectedGuest.name}</span>
                          </div>
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            O anfitrião cadastrou este convite como <b>individual</b>. Não é permitido levar acompanhante nem adicionar outros nomes. A confirmação é válida exclusivamente para você (1 pessoa).
                          </p>
                        </div>
                      ) : (
                        /* CASE 2: Can bring companions -> Guest must choose quantity and name each companion */
                        <div className="p-5 bg-stone-50/90 rounded-2xl border border-stone-200 space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-bold text-stone-800">
                                Quantas pessoas irão comparecer ao todo (incluindo você)? *
                              </label>
                              <span className="text-[10px] font-semibold text-[#882C4E] bg-rose-100 px-2 py-0.5 rounded">
                                Limite de até {allowedCompanions + 1} pessoas
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mb-2.5">
                              O anfitrião autorizou você a levar até {allowedCompanions} acompanhante{allowedCompanions === 1 ? '' : 's'}. Selecione abaixo:
                            </p>

                            <div className="flex items-center gap-2">
                              {Array.from({ length: allowedCompanions + 1 }, (_, i) => i + 1).map(num => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => handleCountChange(num)}
                                  className={`w-11 h-11 rounded-xl text-sm font-bold transition cursor-pointer ${
                                    confirmedCount === num
                                      ? 'bg-[#882C4E] text-white shadow-md'
                                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                              <span className="text-xs font-bold text-[#882C4E] ml-2">
                                {confirmedCount === 1 ? 'Apenas eu (1 pessoa)' : `${confirmedCount} pessoas no total`}
                              </span>
                            </div>
                          </div>

                          {/* Companion Names Inputs */}
                          {confirmedCount > 1 ? (
                            <div className="space-y-3 pt-3 border-t border-stone-200">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                                <Users className="w-4 h-4 text-[#882C4E]" />
                                <span>Confirmação dos Nomes (Obrigatório para entrada no evento):</span>
                              </div>
                              <p className="text-[11px] text-stone-500">
                                Conforme determinado pelo cerimonial, informe o nome completo de cada pessoa que você vai levar:
                              </p>

                              <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs">
                                <span className="text-stone-400 text-[10px] uppercase font-bold block">1. Titular do Convite</span>
                                <span className="font-bold text-stone-900">{selectedGuest.name}</span>
                              </div>

                              {Array.from({ length: confirmedCount - 1 }).map((_, idx) => (
                                <div key={idx}>
                                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                                    {idx + 2}. Nome completo do {idx + 1}º Acompanhante *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={companionNames[idx + 1] || ''}
                                    onChange={(e) => handleCompanionNameChange(idx + 1, e.target.value)}
                                    placeholder={`Ex: Nome completo do acompanhante ${idx + 1}`}
                                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30 focus:border-[#882C4E]"
                                  />
                                </div>
                              ))}

                              {companionError && (
                                <p className="text-xs text-rose-700 font-semibold flex items-center gap-1 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span>{companionError}</span>
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-600">
                              Confirmando presença <b>apenas para você ({selectedGuest.name})</b>, sem acompanhantes.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Dietary restrictions */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-stone-400" />
                          <span>Restrições alimentares ou alergias (opcional):</span>
                        </label>
                        <input
                          type="text"
                          value={dietaryRestrictions}
                          onChange={(e) => setDietaryRestrictions(e.target.value)}
                          placeholder="Ex: Vegetariano, Vegano, Celíaco, Intolerância a lactose..."
                          className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Message to hosts */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                      <span>Deixe uma mensagem de carinho para os anfitriões (opcional):</span>
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Deseje seus votos de felicidade, bênçãos e carinho..."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#882C4E]/20"
                    />
                  </div>

                  {/* Information banner before submitting */}
                  <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-600 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>
                      Atenção: após clicar em confirmar ou enviar, sua resposta será gravada em definitivo e não poderá ser alterada por esta página.
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-[#882C4E] hover:bg-[#732240] text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-rose-200" />
                        <span>
                          {attendance === 'yes' ? 'Confirmar Presença Agora (Finalizar)' : 'Registrar Não Comparecimento (Finalizar)'}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer Cerimonial Badge */}
        <div className="text-center pt-4 text-xs text-stone-400 space-y-1">
          <div className="flex items-center justify-center gap-1 text-[#882C4E] font-serif font-bold text-sm">
            <Heart className="w-4 h-4 fill-[#882C4E]" />
            <span>Cerimonial Amor Perfeito</span>
          </div>
          <p>Assessoria e Cerimonial de Casamentos & Eventos Especiais</p>
        </div>
      </div>
    </div>
  );
};
