import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { EventRsvp, Guest, RsvpStatus } from '../../types';
import { formatDate } from '../../utils/pdfGenerator';
import { Storage, normalizeText } from '../../utils/storage';
import { 
  Heart, Calendar, Clock, MapPin, Search, CheckCircle2, 
  XCircle, Utensils, MessageSquare, Sparkles, AlertCircle, 
  ArrowLeft, ExternalLink, ShieldCheck, UserCheck, RefreshCw,
  PartyPopper, ChevronDown, Phone
} from 'lucide-react';

interface PublicRsvpViewProps {
  slug?: string;
  onBackToAdmin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const PublicRsvpView: React.FC<PublicRsvpViewProps> = ({
  slug,
  onBackToAdmin,
  isAdminLoggedIn,
}) => {
  const [event, setEvent] = useState<EventRsvp | null>(null);
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
  const [confirmedCount, setConfirmedCount] = useState<number>(1);
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const formatPhoneInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
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
      populateFormWithGuest(found[0]);
    } else if (found.length === 0) {
      setSelectedGuest(null);
    }
  };

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  // Helper to prefill form for a guest
  const populateFormWithGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setSearchQuery(guest.name);
    setGuestPhone(guest.phone || '');
    setPhoneError('');

    if (guest.status === 'confirmed') {
      setAttendance('yes');
      setConfirmedCount(guest.confirmedCount || 1);
      setCompanionNames(guest.companionNames && guest.companionNames.length > 0 ? guest.companionNames : [guest.name]);
      setDietaryRestrictions(guest.dietaryRestrictions || '');
      setMessage(guest.message || '');
      setIsSubmitted(true);
      setSubmissionSuccess(true);
    } else if (guest.status === 'declined') {
      setAttendance('no');
      setMessage(guest.message || '');
      setIsSubmitted(true);
      setSubmissionSuccess(true);
    } else {
      // Pending
      setAttendance('yes');
      const defaultPax = guest.maxCompanions > 0 ? (guest.maxCompanions + 1) : 1;
      setConfirmedCount(defaultPax);
      setCompanionNames([guest.name]);
      setDietaryRestrictions('');
      setMessage('');
      setIsSubmitted(false);
      setSubmissionSuccess(false);
    }
  };

  // Load event and check for pre-selected guest in query parameters
  useEffect(() => {
    const loadEventData = async () => {
      // 1. Check query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      
      const targetSlug = slug || urlParams.get('rsvp') || urlParams.get('evento') || hashParams.get('rsvp') || hashParams.get('evento');
      const targetGuestId = urlParams.get('convidado') || urlParams.get('guest') || urlParams.get('g') || hashParams.get('convidado');

      // 2. Fetch locally first
      let currentEvent = Storage.getEvents().find(e => 
        e.slug === targetSlug || 
        e.id === targetSlug ||
        normalizeText(e.slug) === normalizeText(targetSlug || '')
      );

      // 3. Fallback to API if not in local storage
      if (!currentEvent && targetSlug) {
        try {
          const res = await fetch(`/api/events/${encodeURIComponent(targetSlug)}`);
          if (res.ok) {
            currentEvent = await res.json();
          }
        } catch {}
      }

      // 4. Default to first event if none specified
      if (!currentEvent) {
        const all = Storage.getEvents();
        if (all.length > 0) currentEvent = all[0];
      }

      if (currentEvent) {
        setEvent(currentEvent);

        // Pre-select guest if provided in URL
        if (targetGuestId) {
          const matchedGuest = currentEvent.guests.find(g => g.id === targetGuestId);
          if (matchedGuest) {
            populateFormWithGuest(matchedGuest);
          }
        }
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

  // Guest selection
  const handleSelectGuest = (guest: Guest) => {
    populateFormWithGuest(guest);
  };

  const handleAttendanceChange = (val: 'yes' | 'no') => {
    setAttendance(val);
  };

  const handleCountChange = (count: number) => {
    setConfirmedCount(count);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !selectedGuest) return;

    // MANDATORY PHONE VALIDATION
    const cleanPhone = guestPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setPhoneError('O telefone com DDD é OBRIGATÓRIO (mínimo 10 dígitos) para confirmar sua presença e diferenciar seu convite caso haja outro convidado com nome igual.');
      return;
    }
    setPhoneError('');

    setIsSubmitting(true);
    const isYes = attendance === 'yes';
    const status: RsvpStatus = isYes ? 'confirmed' : 'declined';
    const count = isYes ? confirmedCount : 0;
    const names = isYes ? companionNames.filter(n => n.trim().length > 0) : [];

    const updatedGuestData: Partial<Guest> = {
      status,
      phone: guestPhone.trim(),
      confirmedCount: count,
      companionNames: names.length > 0 ? names : [selectedGuest.name],
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
    setSelectedGuest({ ...selectedGuest, ...updatedGuestData });

    // Trigger celebration
    if (isYes) {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#882C4E', '#B85C7D', '#D4AF37', '#FAD02C', '#E8A598'],
      });
    }

    setIsSubmitted(true);
    setSubmissionSuccess(true);
    setIsSubmitting(false);
  };

  // Accent-insensitive matching
  const matchingGuests = (event?.guests || []).filter(g => {
    if (!searchQuery.trim()) return false;
    const normGuest = normalizeText(g.name);
    const normQuery = normalizeText(searchQuery);
    return normGuest.includes(normQuery);
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-md text-center border border-rose-100">
          <AlertCircle className="w-12 h-12 text-[#882C4E] mx-auto mb-3" />
          <h2 className="text-xl font-serif font-bold text-stone-800">Carregando Evento...</h2>
          <p className="text-xs text-stone-500 mt-2">
            Localizando o evento do Cerimonial Amor Perfeito. Por favor, aguarde...
          </p>
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="mt-6 px-5 py-2.5 bg-[#882C4E] text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Voltar ao Painel
            </button>
          )}
        </div>
      </div>
    );
  }

  const maxAllowedPeople = (selectedGuest?.maxCompanions || 0) + 1;

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

          {/* Step 1: Search Name in the Registered Guest List (STRICT PRIVACY: NO OPEN LIST OF NAMES) */}
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
                        setIsSubmitted(false);
                        setSubmissionSuccess(false);
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

            {/* If searched and MULTIPLE matches (e.g. guests with identical or similar names) */}
            {hasSearched && matchedGuests.length > 1 && !selectedGuest && (
              <div className="space-y-2 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <p className="text-xs font-bold text-stone-800">
                  Encontramos {matchedGuests.length} convites com este nome. Por favor, identifique qual é o seu convite:
                </p>
                <div className="space-y-2">
                  {matchedGuests.map(guest => (
                    <div
                      key={guest.id}
                      className="p-3 bg-white rounded-xl border border-stone-200/80 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-stone-900 text-xs">{guest.name}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          {guest.maxCompanions > 0 ? `Convite para até ${guest.maxCompanions + 1} pessoas` : 'Convite individual'}
                          {guest.tableNumber && ` • ${guest.tableNumber}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => populateFormWithGuest(guest)}
                        className="px-3 py-1.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-lg text-xs font-bold cursor-pointer transition shrink-0"
                      >
                        Este é o Meu Convite
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Guest Card & Confirmation Form */}
            {selectedGuest && (
              <div className="pt-6 border-t border-stone-100 space-y-6">
                {/* Guest Identity Banner */}
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">
                      Convite Selecionado
                    </span>
                    <h3 className="text-base font-bold text-stone-900">{selectedGuest.name}</h3>
                    <p className="text-xs text-stone-600">
                      Válido para até <b>{maxAllowedPeople} pessoa(s)</b>
                      {selectedGuest.tableNumber && ` • ${selectedGuest.tableNumber}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedGuest.status === 'confirmed' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Presença Confirmada ({selectedGuest.confirmedCount} pax)</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuest(null);
                        setSearchQuery('');
                        setIsSubmitted(false);
                        setSubmissionSuccess(false);
                      }}
                      className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    >
                      Trocar nome
                    </button>
                  </div>
                </div>

                {/* Form to submit or edit attendance */}
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

                  {/* Step 3: Mandatory Phone Number Field (Differentiator for guests with same name) */}
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

                  {/* If Attending: Specify counts and names */}
                  {attendance === 'yes' && (
                    <div className="space-y-5 p-5 bg-stone-50/80 rounded-2xl border border-stone-200">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                          Quantas pessoas da sua família / convite irão comparecer?
                        </label>
                        <div className="flex items-center gap-2">
                          {Array.from({ length: maxAllowedPeople }, (_, i) => i + 1).map(num => (
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
                          <span className="text-xs text-stone-500 ml-2">
                            {confirmedCount === 1 ? '1 pessoa' : `${confirmedCount} pessoas`}
                          </span>
                        </div>
                      </div>

                      {/* Companion Names */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-stone-700">
                          Nome de quem estará presente (para a lista de entrada do cerimonial):
                        </label>
                        {Array.from({ length: confirmedCount }).map((_, idx) => (
                          <input
                            key={idx}
                            type="text"
                            required
                            value={companionNames[idx] ?? (idx === 0 ? selectedGuest.name : '')}
                            onChange={(e) => handleCompanionNameChange(idx, e.target.value)}
                            placeholder={idx === 0 ? `Nome completo (${selectedGuest.name})` : `Nome do acompanhante ${idx + 1}`}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#882C4E]"
                          />
                        ))}
                      </div>

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
                          {attendance === 'yes' ? 'Confirmar Presença Agora' : 'Registrar Resposta'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Confirmation Success Alert */}
                  {submissionSuccess && (
                    <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 text-center space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-center gap-2 font-bold text-base text-emerald-800">
                        <PartyPopper className="w-5 h-5 text-emerald-600" />
                        <span>Presença Registrada com Sucesso!</span>
                      </div>
                      <p className="text-xs text-emerald-700">
                        {attendance === 'yes'
                          ? `Tudo pronto! Seu nome e de seus ${confirmedCount} acompanhante(s) constam confirmados na lista do Cerimonial Amor Perfeito.`
                          : 'Sua resposta foi registrada. Os anfitriões agradecem o aviso carinhoso!'}
                      </p>
                    </div>
                  )}
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
