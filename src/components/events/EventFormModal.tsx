import React, { useState } from 'react';
import { EventRsvp } from '../../types';
import { X, Sparkles, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';

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
      guests: initialEvent?.guests || [],
      createdAt: initialEvent?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSave(savedEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#882C4E] to-[#B85C7D] text-white shrink-0">
          <div>
            <h2 className="text-lg font-serif font-bold">
              {initialEvent ? 'Editar Evento' : 'Cadastrar Novo Evento'}
            </h2>
            <p className="text-xs text-rose-100 font-light">
              Configure as informações para exibição na página de confirmação de presença (RSVP)
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
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
                Data Limite para Confirmação *
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
              rows={3}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none"
            />
          </div>

          {/* Banner selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#882C4E]" />
              <span>Foto de Capa do Evento</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {PRESET_BANNERS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setBannerImage(preset.url)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 h-18 transition ${
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
              Salvar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
