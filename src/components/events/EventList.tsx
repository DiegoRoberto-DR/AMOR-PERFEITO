import React from 'react';
import { EventRsvp } from '../../types';
import { formatDate } from '../../utils/pdfGenerator';
import { 
  Plus, Users, Share2, Calendar, MapPin, Clock, Edit2, 
  Trash2, CheckCircle2, XCircle, AlertCircle, Sparkles, ExternalLink 
} from 'lucide-react';

interface EventListProps {
  events: EventRsvp[];
  onNewEvent: () => void;
  onEditEvent: (event: EventRsvp) => void;
  onDeleteEvent: (id: string) => void;
  onManageGuests: (event: EventRsvp) => void;
  onShareEvent: (event: EventRsvp) => void;
  onOpenPublicRsvp: (slug: string) => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onNewEvent,
  onEditEvent,
  onDeleteEvent,
  onManageGuests,
  onShareEvent,
  onOpenPublicRsvp,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Eventos & Listas de Confirmação (RSVP)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Cadastre os eventos, monte a lista com os nomes dos convidados e gere o link exclusivo para colocar no convite.
          </p>
        </div>

        <button
          onClick={onNewEvent}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#882C4E] hover:bg-[#732240] text-white rounded-2xl text-sm font-semibold shadow-md hover:shadow-lg transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Evento</span>
        </button>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-700">Nenhum evento cadastrado</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Cadastre seu primeiro casamento ou aniversário de 15 anos para começar a montar a lista de convidados e gerar o link de confirmação.
          </p>
          <button
            onClick={onNewEvent}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-[#882C4E] text-white rounded-xl text-xs font-medium hover:bg-[#732240] transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Evento</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(event => {
            const totalGuests = event.guests.length;
            const confirmedGuests = event.guests.filter(g => g.status === 'confirmed');
            const totalPeopleConfirmed = confirmedGuests.reduce((sum, g) => sum + (g.confirmedCount || 1), 0);
            const pendingCount = event.guests.filter(g => g.status === 'pending').length;
            const declinedCount = event.guests.filter(g => g.status === 'declined').length;
            const confirmedRatio = totalGuests > 0 ? Math.round((confirmedGuests.length / totalGuests) * 100) : 0;

            return (
              <div
                key={event.id}
                className="bg-white rounded-3xl border border-stone-200/90 hover:border-rose-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Banner or Header */}
                <div className="relative p-6 bg-gradient-to-r from-stone-900/80 to-stone-900/50 text-white min-h-[120px] flex flex-col justify-end">
                  {event.bannerImage && (
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover -z-10 brightness-75"
                    />
                  )}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenPublicRsvp(event.slug)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-medium text-white transition cursor-pointer"
                      title="Abrir como convidado"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ver Página</span>
                    </button>
                  </div>

                  <span className="inline-block px-2.5 py-0.5 bg-rose-900/80 text-rose-200 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1 w-fit">
                    {event.eventType}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white tracking-wide">
                    {event.title}
                  </h3>
                  {event.subtitle && (
                    <p className="text-xs text-stone-200 line-clamp-1 italic font-light">
                      {event.subtitle}
                    </p>
                  )}
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#882C4E]" />
                      <span>{formatDate(event.eventDate)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#882C4E]" />
                      <span>{event.eventTime}</span>
                    </div>

                    <div className="col-span-2 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#882C4E] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-stone-800">{event.locationName}</div>
                        <div className="text-[11px] text-stone-500 line-clamp-1">{event.locationAddress}</div>
                      </div>
                    </div>
                  </div>

                  {/* RSVP Stat Counters */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-700">Taxa de Confirmação:</span>
                      <span className="font-bold text-[#882C4E]">{confirmedRatio}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#882C4E] to-[#B85C7D] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${confirmedRatio}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
                        <div className="font-extrabold text-sm">{totalPeopleConfirmed}</div>
                        <div className="text-[10px] text-emerald-600 font-medium">Confirmados</div>
                      </div>

                      <div className="p-2 bg-amber-50 rounded-xl text-amber-800">
                        <div className="font-extrabold text-sm">{pendingCount}</div>
                        <div className="text-[10px] text-amber-600 font-medium">Pendentes</div>
                      </div>

                      <div className="p-2 bg-rose-50 rounded-xl text-rose-800">
                        <div className="font-extrabold text-sm">{declinedCount}</div>
                        <div className="text-[10px] text-rose-600 font-medium">Recusados</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-stone-50/70 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onManageGuests(event)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Lista de Convidados ({totalGuests})</span>
                    </button>

                    <button
                      onClick={() => onShareEvent(event)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-[#882C4E] border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Gerar Link do Convite</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditEvent(event)}
                      className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition cursor-pointer"
                      title="Editar evento"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Excluir evento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
