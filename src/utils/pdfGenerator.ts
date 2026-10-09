import jsPDF from 'jspdf';
import { Budget, CerimonialSettings, EventRsvp } from '../types';

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const generateBudgetPDF = (budget: Budget, settings: CerimonialSettings) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Header Background Accent Bar
  doc.setFillColor(248, 243, 239); // soft rose-champagne
  doc.rect(margin, 12, contentWidth, 34, 'F');

  // Decorative border
  doc.setDrawColor(217, 180, 160); // rose-gold tone
  doc.setLineWidth(0.6);
  doc.rect(margin, 12, contentWidth, 34, 'D');

  // Company Title
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(136, 44, 78); // wine/burgundy rose
  doc.text(settings.companyName.toUpperCase(), margin + 6, 23);

  // Tagline
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(120, 113, 108);
  doc.text(settings.tagline, margin + 6, 29);

  // Contact info in header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 90, 85);
  doc.text(`Tel/WhatsApp: ${settings.phone} | Instagram: ${settings.instagram}`, margin + 6, 35);
  doc.text(`E-mail: ${settings.email}`, margin + 6, 40);

  // Right-side Proposal Code Badge
  doc.setFillColor(136, 44, 78);
  doc.roundedRect(pageWidth - margin - 52, 16, 46, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('PROPOSTA COMERCIAL', pageWidth - margin - 29, 21.5, { align: 'center' });
  doc.setFontSize(8.5);
  doc.text(budget.code, pageWidth - margin - 29, 26, { align: 'center' });

  // Status & Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108);
  doc.text(`Emissão: ${formatDate(budget.createdAt)}`, pageWidth - margin - 6, 35, { align: 'right' });
  doc.text(`Validade: ${formatDate(budget.validUntil)}`, pageWidth - margin - 6, 40, { align: 'right' });

  y = 52;

  // Client & Event Details Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(229, 225, 220);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'FD');

  // Header within client box
  doc.setFillColor(243, 238, 233);
  doc.roundedRect(margin, y, contentWidth, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 40, 60);
  doc.text('DADOS DO CLIENTE & DETALHES DO EVENTO', margin + 4, y + 5);

  const col1X = margin + 4;
  const col2X = margin + (contentWidth / 2) + 2;
  const detailY = y + 13;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Cliente:', col1X, detailY);
  doc.setFont('helvetica', 'normal');
  doc.text(budget.clientName, col1X + 16, detailY);

  doc.setFont('helvetica', 'bold');
  doc.text('WhatsApp:', col1X, detailY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(budget.clientPhone || 'Não informado', col1X + 19, detailY + 6);

  if (budget.clientEmail) {
    doc.setFont('helvetica', 'bold');
    doc.text('E-mail:', col1X, detailY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(budget.clientEmail, col1X + 14, detailY + 12);
  }

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.text('Evento:', col2X, detailY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${budget.eventType} (${budget.estimatedGuests} convidados)`, col2X + 14, detailY);

  doc.setFont('helvetica', 'bold');
  doc.text('Data:', col2X, detailY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(budget.eventDate), col2X + 11, detailY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Local:', col2X, detailY + 12);
  doc.setFont('helvetica', 'normal');
  const locLines = doc.splitTextToSize(budget.eventLocation || 'A definir', (contentWidth / 2) - 20);
  doc.text(locLines, col2X + 12, detailY + 12);

  y += 42;

  // Items Table Header
  doc.setFillColor(136, 44, 78);
  doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('ITEM / ESPECIFICAÇÃO DO SERVIÇO', margin + 4, y + 4.8);
  doc.text('CATEGORIA', margin + 104, y + 4.8);
  doc.text('QTD', margin + 130, y + 4.8, { align: 'center' });
  doc.text('VALOR UNIT.', margin + 148, y + 4.8);
  doc.text('TOTAL', pageWidth - margin - 4, y + 4.8, { align: 'right' });

  y += 7;

  // Items List
  doc.setFontSize(8);
  budget.items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(252, 250, 248);
      doc.rect(margin, y, contentWidth, 12, 'F');
    }

    doc.setDrawColor(235, 230, 225);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 12, pageWidth - margin, y + 12);

    // Item Name and Description
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(item.name, margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 105, 100);
    const descLines = doc.splitTextToSize(item.description || '', 96);
    doc.text(descLines[0] || '', margin + 4, y + 8.5);

    // Category
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(90, 80, 80);
    doc.text(item.category || 'Serviço', margin + 104, y + 6);

    // Qtd
    doc.text(String(item.quantity || 1), margin + 130, y + 6, { align: 'center' });

    // Unit Price
    doc.text(formatCurrency(item.unitPrice), margin + 148, y + 6);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(formatCurrency(item.total), pageWidth - margin - 4, y + 6, { align: 'right' });

    y += 12;
  });

  y += 4;

  // Financial Summary Box
  const summaryBoxWidth = 80;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;
  doc.setFillColor(252, 249, 246);
  doc.setDrawColor(217, 180, 160);
  doc.setLineWidth(0.4);
  doc.roundedRect(summaryBoxX, y, summaryBoxWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text('Subtotal:', summaryBoxX + 6, y + 6);
  doc.text(formatCurrency(budget.subtotal), pageWidth - margin - 6, y + 6, { align: 'right' });

  if (budget.discount > 0) {
    doc.setTextColor(180, 40, 40);
    doc.text('Desconto Especial:', summaryBoxX + 6, y + 12);
    doc.text(`- ${formatCurrency(budget.discount)}`, pageWidth - margin - 6, y + 12, { align: 'right' });
  }

  doc.setDrawColor(217, 180, 160);
  doc.setLineWidth(0.4);
  doc.line(summaryBoxX + 4, y + 16, pageWidth - margin - 4, y + 16);

  // Grand Total Highlight
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(136, 44, 78);
  doc.text('VALOR TOTAL:', summaryBoxX + 6, y + 22);
  doc.text(formatCurrency(budget.total), pageWidth - margin - 6, y + 22, { align: 'right' });

  // Payment conditions on the left of summary box
  const termsWidth = contentWidth - summaryBoxWidth - 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(229, 225, 220);
  doc.roundedRect(margin, y, termsWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 40, 60);
  doc.text('FORMA DE PAGAMENTO & CONDICIONAMENTO', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 70);
  const payLines = doc.splitTextToSize(budget.paymentTerms || 'A combinar com a assessoria.', termsWidth - 8);
  doc.text(payLines, margin + 4, y + 10);

  if (settings.pixKey) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Chave PIX: ${settings.pixKey}`, margin + 4, y + 22);
  }

  y += 32;

  // General Notes and Terms Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(229, 225, 220);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 40, 60);
  doc.text('OBSERVAÇÕES & CONDIÇÕES CONTRATUAIS GERAIS', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  const combinedTerms = `${budget.notes ? `Observações:\n${budget.notes}\n\n` : ''}${settings.defaultTerms}`;
  const termLines = doc.splitTextToSize(combinedTerms, contentWidth - 8);
  doc.text(termLines.slice(0, 7), margin + 4, y + 10);

  y += 40;

  // Signatures Area
  const sigY = Math.min(y, pageHeight - 26);
  const sigWidth = 70;

  doc.setDrawColor(180, 170, 160);
  doc.setLineWidth(0.4);
  doc.line(margin + 10, sigY + 8, margin + 10 + sigWidth, sigY + 8);
  doc.line(pageWidth - margin - 10 - sigWidth, sigY + 8, pageWidth - margin - 10, sigY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 80, 80);
  doc.text(settings.companyName, margin + 10 + (sigWidth / 2), sigY + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Assessoria & Cerimonial', margin + 10 + (sigWidth / 2), sigY + 15, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(budget.clientName, pageWidth - margin - 10 - (sigWidth / 2), sigY + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Contratante / Aceite', pageWidth - margin - 10 - (sigWidth / 2), sigY + 15, { align: 'center' });

  // Footer Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(150, 140, 135);
  doc.text(
    `Documento gerado pelo sistema do Cerimonial Amor Perfeito em ${new Date().toLocaleString('pt-BR')}.`,
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  // Clean filename
  const cleanClient = budget.clientName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Orcamento_${budget.code}_${cleanClient}.pdf`;
  doc.save(filename);
  return filename;
};

export const generateGuestListPDF = (event: EventRsvp, settings: CerimonialSettings) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const drawHeader = (pageNum: number, totalPages?: number) => {
    // Header Bar
    doc.setFillColor(136, 44, 78); // wine/burgundy
    doc.rect(margin, y, contentWidth, 20, 'F');

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`${settings.companyName.toUpperCase()} • LISTA OFICIAL DE PORTARIA & RECEPÇÃO`, margin + 4, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(245, 230, 235);
    doc.text(`Evento: ${event.title} (${event.eventType}) • Data: ${formatDate(event.eventDate)} às ${event.eventTime} • Local: ${event.locationName}`, margin + 4, y + 14);

    y += 24;

    // Sub-header stats (only on page 1)
    if (pageNum === 1) {
      const confirmedGuests = event.guests.filter(g => g.status === 'confirmed');
      const confirmedPax = confirmedGuests.reduce((sum, g) => sum + (g.confirmedCount || 1), 0);
      const pendingGuests = event.guests.filter(g => g.status === 'pending');
      const declinedGuests = event.guests.filter(g => g.status === 'declined');

      doc.setFillColor(250, 245, 242);
      doc.setDrawColor(220, 205, 200);
      doc.roundedRect(margin, y, contentWidth, 12, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);

      doc.text(`Total de Convites: ${event.guests.length}`, margin + 4, y + 7);
      doc.setTextColor(34, 139, 34);
      doc.text(`Confirmados: ${confirmedGuests.length} (${confirmedPax} pessoas presentes)`, margin + 50, y + 7);
      doc.setTextColor(180, 100, 20);
      doc.text(`Pendentes: ${pendingGuests.length}`, margin + 125, y + 7);
      doc.setTextColor(180, 40, 40);
      doc.text(`Não Irão: ${declinedGuests.length}`, margin + 155, y + 7);

      y += 16;
    }

    // Table Header
    doc.setFillColor(240, 235, 232);
    doc.setDrawColor(210, 200, 195);
    doc.rect(margin, y, contentWidth, 7, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 40, 50);

    doc.text('CHECK', margin + 2, y + 4.8);
    doc.text('Nº', margin + 14, y + 4.8);
    doc.text('NOME DO CONVIDADO / FAMÍLIA', margin + 22, y + 4.8);
    doc.text('TELEFONE', margin + 85, y + 4.8);
    doc.text('MESA / GRUPO', margin + 120, y + 4.8);
    doc.text('STATUS', margin + 148, y + 4.8);
    doc.text('PAX CONFIRMADO', pageWidth - margin - 2, y + 4.8, { align: 'right' });

    y += 7;
  };

  // Sort guests alphabetically by name
  const sortedGuests = [...event.guests].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  drawHeader(1);

  let pageNum = 1;

  sortedGuests.forEach((guest, index) => {
    // Check page overflow
    if (y > pageHeight - 20) {
      // Draw footer on current page
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(140, 135, 130);
      doc.text(`Página ${pageNum} • ${settings.companyName} • Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

      doc.addPage();
      pageNum++;
      y = 14;
      drawHeader(pageNum);
    }

    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(253, 251, 250);
      doc.rect(margin, y, contentWidth, 9, 'F');
    }

    doc.setDrawColor(230, 225, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 9, pageWidth - margin, y + 9);

    // Checkbox box
    doc.setDrawColor(160, 150, 145);
    doc.rect(margin + 3, y + 2, 5, 5);

    // Index
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(String(index + 1), margin + 14, y + 6);

    // Guest Name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    const shortName = guest.name.length > 36 ? guest.name.substring(0, 36) + '...' : guest.name;
    doc.text(shortName, margin + 22, y + 6);

    // Phone
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(guest.phone || '-', margin + 85, y + 6);

    // Table / Category
    const tableInfo = guest.tableNumber ? `${guest.tableNumber}` : (guest.category || '-');
    doc.text(tableInfo, margin + 120, y + 6);

    // Status Badge
    doc.setFont('helvetica', 'bold');
    if (guest.status === 'confirmed') {
      doc.setTextColor(34, 139, 34);
      doc.text('CONFIRMADO', margin + 148, y + 6);
    } else if (guest.status === 'declined') {
      doc.setTextColor(180, 40, 40);
      doc.text('NÃO IRÁ', margin + 148, y + 6);
    } else {
      doc.setTextColor(160, 100, 20);
      doc.text('PENDENTE', margin + 148, y + 6);
    }

    // Pax / Companions
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const paxText = guest.status === 'confirmed' 
      ? `${guest.confirmedCount} pessoa(s)` 
      : (guest.maxCompanions > 0 ? `Até ${guest.maxCompanions + 1} pax` : '1 pax');
    doc.text(paxText, pageWidth - margin - 2, y + 6, { align: 'right' });

    y += 9;
  });

  // Final Page Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 135, 130);
  doc.text(`Página ${pageNum} • ${settings.companyName} • Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

  const cleanEvent = event.title.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Lista_Portaria_${cleanEvent}.pdf`;
  doc.save(filename);
  return filename;
};
