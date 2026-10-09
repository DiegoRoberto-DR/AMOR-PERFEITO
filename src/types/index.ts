export interface BudgetItem {
  id: string;
  name: string;
  description: string;
  category: 'Cerimonial' | 'Assessoria' | 'Decoração' | 'Coordenação' | 'Música' | 'Outros';
  quantity: number;
  unitPrice: number;
  total: number;
}

export type BudgetStatus = 'Rascunho' | 'Enviado' | 'Aprovado' | 'Fechado' | 'Cancelado';

export interface Budget {
  id: string;
  code: string; // ex: AP-2026-001
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  eventType: 'Casamento' | 'Aniversário de 15 Anos' | 'Bodas' | 'Formatura' | 'Corporativo' | 'Outro';
  eventDate: string;
  eventLocation: string;
  estimatedGuests: number;
  items: BudgetItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentTerms: string;
  validUntil: string;
  notes: string;
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
}

export type RsvpStatus = 'pending' | 'confirmed' | 'declined';

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  category?: 'Família' | 'Padrinhos' | 'Amigos' | 'Trabalho' | 'Geral';
  tableNumber?: string;
  maxCompanions: number; // quantos acompanhantes permitidos além do titular
  status: RsvpStatus;
  confirmedCount: number; // total de pessoas confirmadas (titular + acompanhantes)
  companionNames: string[];
  dietaryRestrictions?: string;
  message?: string;
  confirmedAt?: string;
}

export interface EventRsvp {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  locationAddress: string;
  locationMapsUrl?: string;
  deadlineDate: string;
  welcomeMessage: string;
  dressCode?: string;
  bannerImage?: string;
  giftRegistryUrl?: string;
  guests: Guest[];
  createdAt: string;
  updatedAt: string;
}

export interface CerimonialSettings {
  companyName: string;
  tagline: string;
  responsibleName: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
  cnpj?: string;
  pixKey?: string;
  bankInfo?: string;
  defaultTerms: string;
}
