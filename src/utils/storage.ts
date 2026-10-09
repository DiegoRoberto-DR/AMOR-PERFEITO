import { Budget, EventRsvp, CerimonialSettings, Guest } from '../types';

export const DEFAULT_SETTINGS: CerimonialSettings = {
  companyName: 'Cerimonial Amor Perfeito',
  tagline: 'Transformando momentos únicos em memórias eternas',
  responsibleName: 'Direção Amor Perfeito',
  phone: '(11) 98765-4321',
  whatsapp: '5511987654321',
  email: 'contato@amorperfeitocerimonial.com.br',
  instagram: '@amorperfeitocerimonial',
  address: 'Av. Paulista, 1800 - Bela Vista, São Paulo - SP',
  cnpj: '45.123.890/0001-76',
  pixKey: 'contato@amorperfeitocerimonial.com.br',
  bankInfo: 'Banco Inter (077) - Ag: 0001 - Conta: 1827364-5',
  defaultTerms: `1. Validade desta proposta: 15 dias corridos a partir da data de emissão.
2. Reserva da data mediante assinatura do contrato e pagamento da primeira parcela (sinal de 30%).
3. O saldo restante poderá ser parcelado em até 10 dias antes da data do evento.
4. Inclui reuniões de alinhamento com fornecedores, ensaio prévio e equipe dedicada no dia.
5. Qualquer serviço adicional solicitado posteriormente será orçado em termo aditivo.`
};

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'budget-1',
    code: 'AP-2026-0089',
    clientName: 'Isabella Mendes & Rafael Vasconcelos',
    clientPhone: '(11) 99123-4567',
    clientEmail: 'isabella.rafael@email.com',
    eventType: 'Casamento',
    eventDate: '2026-11-21',
    eventLocation: 'Espaço Jardim Leopoldina - Vila Leopoldina, São Paulo',
    estimatedGuests: 220,
    items: [
      {
        id: 'i1',
        name: 'Assessoria Completa e Planejamento',
        description: 'Gestão de cronograma, contratação e alinhamento de fornecedores, visitas técnicas, consultoria de estilo e reuniões ilimitadas.',
        category: 'Assessoria',
        quantity: 1,
        unitPrice: 5800,
        total: 5800,
      },
      {
        id: 'i2',
        name: 'Cerimonial do Dia (Equipe de 5 Coordenadoras)',
        description: 'Coordenação minuciosa do cortejo, recepção dos noivos e convidados, kit SOS noiva, checagem de buffet e cerimonial de corte de bolo.',
        category: 'Cerimonial',
        quantity: 1,
        unitPrice: 3200,
        total: 3200,
      },
      {
        id: 'i3',
        name: 'RSVP Ativo e Passivo Personalizado',
        description: 'Criação do link exclusivo de confirmação, contato ativo por WhatsApp com faltantes e entrega de relatório final com mapa de mesas.',
        category: 'Outros',
        quantity: 1,
        unitPrice: 900,
        total: 900,
      },
      {
        id: 'i4',
        name: 'Ensaio Geral com Noivos e Padrinhos',
        description: 'Simulação do cortejo no local da cerimônia 2 dias antes com música guia e instrução dos padrinhos e daminhas.',
        category: 'Coordenação',
        quantity: 1,
        unitPrice: 600,
        total: 600,
      }
    ],
    subtotal: 10500,
    discount: 500,
    total: 10000,
    paymentTerms: 'Entrada de 30% (R$ 3.000,00) via PIX na assinatura + 4x de R$ 1.750,00 no boleto bancário.',
    validUntil: '2026-10-31',
    notes: 'Proposta promocional exclusiva com desconto especial de fechamento.',
    status: 'Aprovado',
    createdAt: '2026-10-01',
    updatedAt: '2026-10-05',
  },
  {
    id: 'budget-2',
    code: 'AP-2026-0092',
    clientName: 'Mariana Duarte (15 Anos da Sophia)',
    clientPhone: '(11) 98321-9988',
    clientEmail: 'mariana.duarte@email.com',
    eventType: 'Aniversário de 15 Anos',
    eventDate: '2026-12-12',
    eventLocation: 'Buffet Mansão Galo - Moema, São Paulo',
    estimatedGuests: 150,
    items: [
      {
        id: 'i1',
        name: 'Cerimonial dos 15 Anos (Valsa e Homenagens)',
        description: 'Roteiro dinâmico, troca de vestidos, valsa dos 15 casais, homenagens aos pais e abertura da pista de dança.',
        category: 'Cerimonial',
        quantity: 1,
        unitPrice: 3500,
        total: 3500,
      },
      {
        id: 'i2',
        name: 'Coordenação e Recepção de Jovens e Adultos',
        description: 'Equipe de 4 coordenadores para controle de pulseiras, recepção e acompanhamento de fotógrafos/DJ.',
        category: 'Coordenação',
        quantity: 1,
        unitPrice: 2200,
        total: 2200,
      }
    ],
    subtotal: 5700,
    discount: 200,
    total: 5500,
    paymentTerms: 'Entrada de R$ 2.000,00 + Saldo parcelado até 05/12/2026 via transferência ou cartão.',
    validUntil: '2026-10-25',
    notes: 'Incluso suporte na escolha dos vestidos da debutante.',
    status: 'Enviado',
    createdAt: '2026-10-06',
    updatedAt: '2026-10-06',
  }
];

export const INITIAL_EVENTS: EventRsvp[] = [
  {
    id: 'event-1',
    slug: 'casamento-amanda-guilherme',
    title: 'Casamento de Amanda & Guilherme',
    subtitle: 'Nossa história de amor celebrada com quem amamos',
    eventType: 'Casamento',
    eventDate: '2026-11-28',
    eventTime: '17:00',
    locationName: 'Villa Bisutti Espaço Casa do Ator',
    locationAddress: 'Rua Casa do Ator, 642 - Vila Olímpia, São Paulo - SP',
    locationMapsUrl: 'https://maps.google.com/?q=Villa+Bisutti+Casa+do+Ator',
    deadlineDate: '2026-11-10',
    welcomeMessage: 'É uma imensa alegria ter você conosco neste momento tão especial! Por favor, confirme a presença da sua família ou acompanhantes até o prazo para organizarmos cada detalhe com carinho.',
    dressCode: 'Traje Passeio Completo / Social',
    bannerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
    giftRegistryUrl: 'https://noivos.site/amanda-guilherme',
    createdAt: '2026-10-02',
    updatedAt: '2026-10-08',
    guests: [
      {
        id: 'g-1',
        name: 'Carlos Alberto Ferreira & Família',
        phone: '(11) 98888-1111',
        category: 'Família',
        tableNumber: 'Mesa 04',
        maxCompanions: 3,
        status: 'confirmed',
        confirmedCount: 3,
        companionNames: ['Carlos Alberto Ferreira', 'Patrícia Ferreira', 'Lucas Ferreira (Filho)'],
        dietaryRestrictions: 'Patrícia é vegetariana',
        message: 'Estamos muito ansiosos e felizes por vocês! Parabéns pelo grande passo!',
        confirmedAt: '2026-10-07 14:32'
      },
      {
        id: 'g-2',
        name: 'Fernanda Lima (Madrinha)',
        phone: '(11) 97777-2222',
        category: 'Padrinhos',
        tableNumber: 'Mesa 01',
        maxCompanions: 1,
        status: 'confirmed',
        confirmedCount: 2,
        companionNames: ['Fernanda Lima', 'Rodrigo Souza'],
        dietaryRestrictions: '',
        message: 'A melhor madrinha do mundo estará presente com todo o amor!',
        confirmedAt: '2026-10-06 18:15'
      },
      {
        id: 'g-3',
        name: 'Marcelo Ribeiro & Esposa',
        phone: '(11) 96666-3333',
        category: 'Amigos',
        tableNumber: 'Mesa 08',
        maxCompanions: 1,
        status: 'pending',
        confirmedCount: 0,
        companionNames: [],
        dietaryRestrictions: '',
        message: ''
      },
      {
        id: 'g-4',
        name: 'Tia Rosa Maria Mendonça',
        phone: '(11) 95555-4444',
        category: 'Família',
        tableNumber: 'Mesa 03',
        maxCompanions: 0,
        status: 'pending',
        confirmedCount: 0,
        companionNames: [],
        dietaryRestrictions: '',
        message: ''
      },
      {
        id: 'g-5',
        name: 'Dr. Paulo Henrique Cavalcanti',
        phone: '(11) 94444-5555',
        category: 'Trabalho',
        tableNumber: 'Mesa 10',
        maxCompanions: 1,
        status: 'declined',
        confirmedCount: 0,
        companionNames: [],
        dietaryRestrictions: '',
        message: 'Queridos noivos, estarei em viagem internacional a trabalho. Desejo toda a felicidade do mundo ao casal!',
        confirmedAt: '2026-10-05 10:20'
      }
    ]
  },
  {
    id: 'event-2',
    slug: '15-anos-sophia-albuquerque',
    title: '15 Anos de Sophia Albuquerque',
    subtitle: 'Uma noite inesquecível de sonhos e celebração',
    eventType: 'Aniversário de 15 Anos',
    eventDate: '2026-12-12',
    eventTime: '20:00',
    locationName: 'Espaço Contemporâneo Festas',
    locationAddress: 'Av. Ibirapuera, 2400 - Moema, São Paulo - SP',
    deadlineDate: '2026-12-01',
    welcomeMessage: 'Venha comemorar os meus 15 anos comigo! Confirme sua presença para que nossa festa seja perfeita!',
    dressCode: 'Esporte Fino / Gala',
    bannerImage: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80',
    createdAt: '2026-10-06',
    updatedAt: '2026-10-06',
    guests: [
      {
        id: 'g-201',
        name: 'Beatriz Vasques & Acompanhante',
        phone: '(11) 99887-1122',
        category: 'Amigos',
        maxCompanions: 1,
        status: 'confirmed',
        confirmedCount: 2,
        companionNames: ['Beatriz Vasques', 'Enzo Gabriel'],
        dietaryRestrictions: 'Sem lactose para Beatriz',
        message: 'Amiga, vai ser a melhor festa do ano! Te amo!',
        confirmedAt: '2026-10-08 19:40'
      },
      {
        id: 'g-202',
        name: 'Gabriel Martins',
        phone: '(11) 98888-3344',
        category: 'Amigos',
        maxCompanions: 0,
        status: 'pending',
        confirmedCount: 0,
        companionNames: [],
        dietaryRestrictions: '',
        message: ''
      }
    ]
  }
];

export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const Storage = {
  getSettings(): CerimonialSettings {
    const raw = localStorage.getItem('amor_perfeito_settings');
    if (!raw) {
      localStorage.setItem('amor_perfeito_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: CerimonialSettings): void {
    localStorage.setItem('amor_perfeito_settings', JSON.stringify(settings));
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).catch(() => {});
  },

  getBudgets(): Budget[] {
    const raw = localStorage.getItem('amor_perfeito_budgets');
    if (!raw) {
      localStorage.setItem('amor_perfeito_budgets', JSON.stringify(INITIAL_BUDGETS));
      return INITIAL_BUDGETS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BUDGETS;
    }
  },

  saveBudgets(budgets: Budget[]): void {
    localStorage.setItem('amor_perfeito_budgets', JSON.stringify(budgets));
  },

  getEvents(): EventRsvp[] {
    const raw = localStorage.getItem('amor_perfeito_events');
    if (!raw) {
      localStorage.setItem('amor_perfeito_events', JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EVENTS;
    }
  },

  saveEvents(events: EventRsvp[]): void {
    localStorage.setItem('amor_perfeito_events', JSON.stringify(events));
  },

  getEventBySlugOrId(identifier: string): EventRsvp | undefined {
    const events = this.getEvents();
    const normalized = normalizeText(identifier);
    return events.find(e => 
      e.slug === identifier || 
      e.id === identifier ||
      normalizeText(e.slug) === normalized ||
      normalizeText(e.title).includes(normalized)
    );
  },

  async syncWithServer(): Promise<{ events: EventRsvp[]; budgets: Budget[]; settings: CerimonialSettings }> {
    try {
      const [eventsRes, budgetsRes, settingsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/budgets'),
        fetch('/api/settings'),
      ]);

      if (eventsRes.ok && budgetsRes.ok && settingsRes.ok) {
        const events = await eventsRes.json();
        const budgets = await budgetsRes.json();
        const settings = await settingsRes.json();

        localStorage.setItem('amor_perfeito_events', JSON.stringify(events));
        localStorage.setItem('amor_perfeito_budgets', JSON.stringify(budgets));
        localStorage.setItem('amor_perfeito_settings', JSON.stringify(settings));

        return { events, budgets, settings };
      }
    } catch (e) {
      // Offline fallback
    }

    return {
      events: this.getEvents(),
      budgets: this.getBudgets(),
      settings: this.getSettings(),
    };
  },

  async updateGuestRsvp(
    eventId: string,
    guestId: string,
    update: Partial<Guest>
  ): Promise<boolean> {
    const events = this.getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId || e.slug === eventId);
    if (eventIndex === -1) return false;

    const guestIndex = events[eventIndex].guests.findIndex(g => g.id === guestId);
    if (guestIndex === -1) return false;

    const confirmedAt = new Date().toLocaleString('pt-BR');
    events[eventIndex].guests[guestIndex] = {
      ...events[eventIndex].guests[guestIndex],
      ...update,
      confirmedAt,
    };
    events[eventIndex].updatedAt = new Date().toISOString().split('T')[0];

    // 1. Save locally
    this.saveEvents(events);

    // 2. Dispatch custom event so all components on the page react instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('amor_perfeito_data_updated', {
          detail: { eventId, guestId, update },
        })
      );
    }

    // 3. Sync with backend API
    try {
      await fetch(`/api/events/${encodeURIComponent(events[eventIndex].slug)}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          status: update.status,
          confirmedCount: update.confirmedCount,
          companionNames: update.companionNames,
          dietaryRestrictions: update.dietaryRestrictions,
          message: update.message,
        }),
      });
    } catch (err) {
      console.warn('API sync deferred to localStorage:', err);
    }

    return true;
  }
};
