import React, { useState, useEffect } from 'react';
import { Budget, EventRsvp, CerimonialSettings, BudgetStatus, Guest } from './types';
import { Storage } from './utils/storage';
import { generateBudgetPDF } from './utils/pdfGenerator';
import { openBudgetWhatsApp } from './utils/whatsapp';
import { Header, ActiveTab } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { Dashboard } from './components/Dashboard';
import { BudgetList } from './components/budgets/BudgetList';
import { BudgetFormModal } from './components/budgets/BudgetFormModal';
import { BudgetPreviewModal } from './components/budgets/BudgetPreviewModal';
import { EventList } from './components/events/EventList';
import { EventFormModal } from './components/events/EventFormModal';
import { GuestListModal } from './components/events/GuestListModal';
import { ShareRsvpModal } from './components/events/ShareRsvpModal';
import { PublicRsvpView } from './components/rsvp/PublicRsvpView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  // Navigation & Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('amor_perfeito_admin') === 'true';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentRsvpSlug, setCurrentRsvpSlug] = useState<string | null>(null);

  // App Data
  const [settings, setSettings] = useState<CerimonialSettings>(() => Storage.getSettings());
  const [budgets, setBudgets] = useState<Budget[]>(() => Storage.getBudgets());
  const [events, setEvents] = useState<EventRsvp[]>(() => Storage.getEvents());

  // Modals state
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isPreviewBudgetOpen, setIsPreviewBudgetOpen] = useState(false);
  const [previewingBudget, setPreviewingBudget] = useState<Budget | null>(null);

  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRsvp | null>(null);

  const [isGuestListOpen, setIsGuestListOpen] = useState(false);
  const [selectedEventForGuests, setSelectedEventForGuests] = useState<EventRsvp | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedEventForShare, setSelectedEventForShare] = useState<EventRsvp | null>(null);

  // Check URL parameters on mount and handle ?rsvp=...
  useEffect(() => {
    const parseUrlParams = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashQuery = window.location.hash.includes('?') 
        ? window.location.hash.substring(window.location.hash.indexOf('?') + 1)
        : '';
      const hashParams = new URLSearchParams(hashQuery);

      const rsvpParam = 
        searchParams.get('rsvp') || 
        searchParams.get('evento') ||
        hashParams.get('rsvp') || 
        hashParams.get('evento');

      const portableData = 
        searchParams.get('ed') || 
        searchParams.get('d') ||
        hashParams.get('ed') || 
        hashParams.get('d');

      if (rsvpParam || portableData) {
        setCurrentRsvpSlug(rsvpParam || 'evento');
      }
    };

    parseUrlParams();
    window.addEventListener('popstate', parseUrlParams);
    window.addEventListener('hashchange', parseUrlParams);

    // Initial server sync
    Storage.syncWithServer().then(({ events: syncedEvents, budgets: syncedBudgets, settings: syncedSettings }) => {
      if (syncedEvents && syncedEvents.length > 0) setEvents(syncedEvents);
      if (syncedBudgets && syncedBudgets.length > 0) setBudgets(syncedBudgets);
      if (syncedSettings) setSettings(syncedSettings);
    });

    // Listen to live data updates from public RSVP
    const handleDataUpdated = () => {
      const refreshed = Storage.getEvents();
      setEvents(refreshed);
    };

    window.addEventListener('amor_perfeito_data_updated', handleDataUpdated);

    return () => {
      window.removeEventListener('popstate', parseUrlParams);
      window.removeEventListener('hashchange', parseUrlParams);
      window.removeEventListener('amor_perfeito_data_updated', handleDataUpdated);
    };
  }, []);

  // Update storage whenever budgets or events change
  const handleSaveBudget = (saved: Budget) => {
    let updated: Budget[];
    const exists = budgets.some(b => b.id === saved.id);
    if (exists) {
      updated = budgets.map(b => (b.id === saved.id ? saved : b));
    } else {
      updated = [saved, ...budgets];
    }
    setBudgets(updated);
    Storage.saveBudgets(updated);
    fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saved)
    }).catch(() => {});
  };

  const handleDeleteBudget = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta proposta comercial?')) {
      const updated = budgets.filter(b => b.id !== id);
      setBudgets(updated);
      Storage.saveBudgets(updated);
      fetch(`/api/budgets/${id}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  const handleUpdateBudgetStatus = (id: string, status: BudgetStatus) => {
    const updated = budgets.map(b => (b.id === id ? { ...b, status, updatedAt: new Date().toISOString().split('T')[0] } : b));
    setBudgets(updated);
    Storage.saveBudgets(updated);
    const target = updated.find(b => b.id === id);
    if (target) {
      fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      }).catch(() => {});
    }
  };

  const handleSaveEvent = (saved: EventRsvp) => {
    let updated: EventRsvp[];
    const exists = events.some(e => e.id === saved.id);
    if (exists) {
      updated = events.map(e => (e.id === saved.id ? saved : e));
    } else {
      updated = [saved, ...events];
    }
    setEvents(updated);
    Storage.saveEvents(updated);
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saved)
    }).catch(() => {});
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento e toda a lista de convidados?')) {
      const updated = events.filter(e => e.id !== id);
      setEvents(updated);
      Storage.saveEvents(updated);
      fetch(`/api/events/${id}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  const handleDeleteAllEvents = async () => {
    await Storage.deleteAllEvents();
    setEvents([]);
  };

  const handleUpdateEventGuests = (eventId: string, updatedGuests: Guest[]) => {
    const updated = events.map(e => {
      if (e.id !== eventId) return e;
      return {
        ...e,
        guests: updatedGuests,
        updatedAt: new Date().toISOString().split('T')[0]
      };
    });
    setEvents(updated);
    Storage.saveEvents(updated);

    const targetEvent = updated.find(e => e.id === eventId);
    if (targetEvent) {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetEvent)
      }).catch(() => {});
    }

    // Keep selected event in sync
    if (selectedEventForGuests?.id === eventId) {
      setSelectedEventForGuests(prev => prev ? { ...prev, guests: updatedGuests } : null);
    }
  };

  const handleSaveSettings = (newSettings: CerimonialSettings) => {
    setSettings(newSettings);
    Storage.saveSettings(newSettings);
  };

  // Actions
  const handleDownloadPdf = (budget: Budget) => {
    generateBudgetPDF(budget, settings);
  };

  const handleSendWhatsapp = (budget: Budget) => {
    openBudgetWhatsApp(budget, settings);
  };

  const handleOpenGuestPreview = () => {
    if (events.length === 0) {
      alert('Nenhum evento cadastrado no momento. Crie um evento primeiro.');
      return;
    }
    const firstSlug = events[0].slug;
    setCurrentRsvpSlug(firstSlug);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('amor_perfeito_admin');
    setIsAdminLoggedIn(false);
  };

  // If a public RSVP slug is active, render the Guest view
  if (currentRsvpSlug) {
    return (
      <PublicRsvpView
        slug={currentRsvpSlug}
        isAdminLoggedIn={isAdminLoggedIn}
        onBackToAdmin={() => {
          // Clear query param without full page reload
          window.history.pushState({}, '', window.location.pathname);
          const refreshed = Storage.getEvents();
          setEvents(refreshed);
          setCurrentRsvpSlug(null);
        }}
      />
    );
  }

  // If user is not logged in as Admin, show login screen
  if (!isAdminLoggedIn) {
    return (
      <LoginModal
        onLoginSuccess={() => setIsAdminLoggedIn(true)}
      />
    );
  }

  // Main Admin Interface
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenGuestPreview={handleOpenGuestPreview}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            budgets={budgets}
            events={events}
            settings={settings}
            onNewBudget={() => {
              setEditingBudget(null);
              setIsBudgetFormOpen(true);
            }}
            onNewEvent={() => {
              setEditingEvent(null);
              setIsEventFormOpen(true);
            }}
            onViewBudget={(budget) => {
              setPreviewingBudget(budget);
              setIsPreviewBudgetOpen(true);
            }}
            onDownloadBudgetPdf={handleDownloadPdf}
            onSendBudgetWhatsapp={handleSendWhatsapp}
            onOpenEventGuests={(event) => {
              setSelectedEventForGuests(event);
              setIsGuestListOpen(true);
            }}
            onShareEvent={(event) => {
              setSelectedEventForShare(event);
              setIsShareModalOpen(true);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetList
            budgets={budgets}
            onNewBudget={() => {
              setEditingBudget(null);
              setIsBudgetFormOpen(true);
            }}
            onEditBudget={(budget) => {
              setEditingBudget(budget);
              setIsBudgetFormOpen(true);
            }}
            onDeleteBudget={handleDeleteBudget}
            onViewBudget={(budget) => {
              setPreviewingBudget(budget);
              setIsPreviewBudgetOpen(true);
            }}
            onDownloadPdf={handleDownloadPdf}
            onSendWhatsapp={handleSendWhatsapp}
            onUpdateStatus={handleUpdateBudgetStatus}
          />
        )}

        {activeTab === 'events' && (
          <EventList
            events={events}
            onNewEvent={() => {
              setEditingEvent(null);
              setIsEventFormOpen(true);
            }}
            onEditEvent={(event) => {
              setEditingEvent(event);
              setIsEventFormOpen(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onDeleteAllEvents={handleDeleteAllEvents}
            onManageGuests={(event) => {
              setSelectedEventForGuests(event);
              setIsGuestListOpen(true);
            }}
            onShareEvent={(event) => {
              setSelectedEventForShare(event);
              setIsShareModalOpen(true);
            }}
            onOpenPublicRsvp={(slug) => {
              setCurrentRsvpSlug(slug);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-rose-100/80 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#882C4E]">Cerimonial Amor Perfeito</span>
            <span>•</span>
            <span>Sistema Integrado de Orçamentos & RSVP</span>
          </div>
          <div className="text-stone-400">
            {settings.phone} • {settings.instagram} • {settings.address}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BudgetFormModal
        isOpen={isBudgetFormOpen}
        onClose={() => setIsBudgetFormOpen(false)}
        onSave={handleSaveBudget}
        initialBudget={editingBudget}
      />

      <BudgetPreviewModal
        isOpen={isPreviewBudgetOpen}
        onClose={() => setIsPreviewBudgetOpen(false)}
        budget={previewingBudget}
        settings={settings}
        onDownloadPdf={handleDownloadPdf}
        onSendWhatsapp={handleSendWhatsapp}
      />

      <EventFormModal
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
      />

      <GuestListModal
        isOpen={isGuestListOpen}
        onClose={() => setIsGuestListOpen(false)}
        event={selectedEventForGuests}
        onUpdateEventGuests={handleUpdateEventGuests}
        onOpenShareModal={(event) => {
          setSelectedEventForShare(event);
          setIsShareModalOpen(true);
        }}
      />

      <ShareRsvpModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        event={selectedEventForShare}
        onOpenPublicRsvp={(slug) => {
          setIsShareModalOpen(false);
          setCurrentRsvpSlug(slug);
        }}
      />
    </div>
  );
}
