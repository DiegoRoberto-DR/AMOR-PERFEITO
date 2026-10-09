import { Budget, CerimonialSettings, EventRsvp, Guest } from '../types';
import { formatCurrency, formatDate } from './pdfGenerator';

export const cleanPhoneForWhatsApp = (rawPhone: string): string => {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';
  // If user only entered 10 or 11 digits (Brazilian DDD + number), prepend Brazil country code 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
};

export const createBudgetWhatsAppMessage = (
  budget: Budget,
  settings: CerimonialSettings
): string => {
  const itemsText = budget.items
    .map(i => `• *${i.name}* (${i.category}): ${formatCurrency(i.total)}`)
    .join('\n');

  const text = `🌸 *${settings.companyName.toUpperCase()}* 🌸
_Assessoria & Cerimonial de Eventos_

Olá, *${budget.clientName}*! Tudo bem? 

É uma honra apresentar a proposta comercial para o seu *${budget.eventType}*! Preparamos tudo com muito carinho e excelência para tornar o seu dia inesquecível.

📋 *DETALHES DA PROPOSTA (#${budget.code})*
📅 *Data Prevista:* ${formatDate(budget.eventDate)}
📍 *Local:* ${budget.eventLocation || 'A definir'}
👥 *Convidados Estimados:* ${budget.estimatedGuests} pessoas

✨ *SERVIÇOS INCLUSOS:*
${itemsText}

💰 *VALOR TOTAL:* ${formatCurrency(budget.total)} ${budget.discount > 0 ? `_(Desconto aplicado: ${formatCurrency(budget.discount)})_` : ''}
💳 *Condições de Pagamento:* ${budget.paymentTerms || 'Consulte nossas opções personalizadas.'}
⏳ *Validade da Proposta:* até ${formatDate(budget.validUntil)}

📎 *O PDF completo com todas as especificações detalhadas foi gerado!*
Caso tenha alguma dúvida ou queira agendar nossa reunião para alinhamento e assinatura, estamos à total disposição.

Com carinho,
*${settings.companyName}*
Instagram: ${settings.instagram}
WhatsApp: ${settings.phone}`;

  return text;
};

export const openBudgetWhatsApp = (budget: Budget, settings: CerimonialSettings) => {
  const phone = cleanPhoneForWhatsApp(budget.clientPhone || '');
  const message = createBudgetWhatsAppMessage(budget, settings);
  const encoded = encodeURIComponent(message);
  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
};

export const createRsvpInvitationWhatsAppMessage = (
  event: EventRsvp,
  guest: Guest,
  rsvpUrl: string
): string => {
  const text = `✨ *CONVITE ESPECIAL & CONFIRMAÇÃO DE PRESENÇA* ✨

Olá, *${guest.name}*!

Você é nosso(a) convidado(a) muito especial para o *${event.title}*! 🥂
${event.subtitle ? `_${event.subtitle}_\n` : ''}
📅 *Data:* ${formatDate(event.eventDate)} às ${event.eventTime}
📍 *Local:* ${event.locationName} (${event.locationAddress})
${guest.maxCompanions > 0 ? `👥 *Convite válido para você e até ${guest.maxCompanions} acompanhante(s).*` : '👥 *Convite individual.*'}

Por favor, confirme sua presença através do nosso link oficial de RSVP até o dia *${formatDate(event.deadlineDate)}*:

👉 *Confirme aqui:* ${rsvpUrl}

${event.welcomeMessage ? `\n"${event.welcomeMessage}"\n` : ''}
Contamos com a sua presença! 💕
_Cerimonial Amor Perfeito_`;

  return text;
};

export const openGuestRsvpWhatsApp = (
  event: EventRsvp,
  guest: Guest,
  rsvpUrl: string
) => {
  const phone = cleanPhoneForWhatsApp(guest.phone || '');
  const message = createRsvpInvitationWhatsAppMessage(event, guest, rsvpUrl);
  const encoded = encodeURIComponent(message);
  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
};
