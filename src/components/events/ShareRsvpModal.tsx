import React, { useState } from 'react';
import { EventRsvp } from '../../types';
import { formatDate } from '../../utils/pdfGenerator';
import { X, Copy, Check, ExternalLink, Share2, MessageCircle, QrCode, Sparkles } from 'lucide-react';

interface ShareRsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventRsvp | null;
  onOpenPublicRsvp: (slug: string) => void;
}

export const ShareRsvpModal: React.FC<ShareRsvpModalProps> = ({
  isOpen,
  onClose,
  event,
  onOpenPublicRsvp,
}) => {
  if (!isOpen || !event) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const origin = window.location.origin;
  const rsvpUrl = `${origin}/?rsvp=${event.slug}`;

  const invitationMessage = `✨ *CONVITE & CONFIRMAÇÃO DE PRESENÇA* ✨

*${event.title}*
${event.subtitle ? `_${event.subtitle}_\n` : ''}
📅 *Data:* ${formatDate(event.eventDate)} às ${event.eventTime}
📍 *Local:* ${event.locationName}
${event.locationAddress ? `Endereço: ${event.locationAddress}\n` : ''}
💌 *Por favor, confirme sua presença no link oficial:*
👉 ${rsvpUrl}

⏳ *Prazo para confirmação:* até ${formatDate(event.deadlineDate)}

${event.welcomeMessage ? `"${event.welcomeMessage}"\n` : ''}
_Cerimonial Amor Perfeito_`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(rsvpUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(invitationMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(invitationMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // QR code image via reliable public API or SVG
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(rsvpUrl)}&color=88-44-78`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#882C4E] to-[#B85C7D] text-white shrink-0">
          <div>
            <h2 className="text-lg font-serif font-bold">Link de RSVP para o Convite</h2>
            <p className="text-xs text-rose-100 font-light">
              Compartilhe com seus convidados para eles confirmarem presença
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Main Link Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Link Oficial do Evento (para colocar no convite impresso ou virtual)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={rsvpUrl}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-[#882C4E] select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* QR Code and Actions */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row items-center gap-5">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-stone-200 shrink-0">
              <img
                src={qrCodeUrl}
                alt="QR Code RSVP"
                className="w-32 h-32 object-contain rounded"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                <QrCode className="w-4 h-4 text-[#882C4E]" />
                <span>QR Code para Convite Impresso</span>
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Adicione este QR Code na arte do seu convite de casamento ou aniversário. Ao apontar a câmera do celular, o convidado acessa diretamente a tela de RSVP.
              </p>
              <div className="pt-1 flex flex-wrap justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => onOpenPublicRsvp(event.slug)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Testar Página de Confirmação</span>
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp Text Template */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Texto Pronto para Enviar no WhatsApp
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-xs font-semibold text-[#882C4E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Texto Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              readOnly
              value={invitationMessage}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 select-all focus:outline-none"
            />

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="mt-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar via WhatsApp Web / App</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
