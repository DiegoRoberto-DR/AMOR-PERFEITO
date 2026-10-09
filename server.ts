import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_EVENTS, INITIAL_BUDGETS, DEFAULT_SETTINGS } from './src/utils/storage.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS for mobile devices and preview environments
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Persistent database file
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBData {
  settings: any;
  budgets: any[];
  events: any[];
}

function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Clean out any legacy mock events
      parsed.events = (parsed.events || []).filter(
        (e: any) => e.slug !== 'casamento-amanda-guilherme' && e.id !== 'event-1' && e.id !== 'event-2'
      );
      return parsed;
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }

  const defaultData: DBData = {
    settings: DEFAULT_SETTINGS,
    budgets: INITIAL_BUDGETS,
    events: [],
  };
  saveDB(defaultData);
  return defaultData;
}

function saveDB(data: DBData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

// API Routes
app.get('/api/settings', (req, res) => {
  const db = loadDB();
  res.json(db.settings);
});

app.post('/api/settings', (req, res) => {
  const db = loadDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json(db.settings);
});

app.get('/api/budgets', (req, res) => {
  const db = loadDB();
  res.json(db.budgets);
});

app.post('/api/budgets', (req, res) => {
  const db = loadDB();
  const newBudget = req.body;
  const index = db.budgets.findIndex((b: any) => b.id === newBudget.id);
  if (index >= 0) {
    db.budgets[index] = newBudget;
  } else {
    db.budgets.unshift(newBudget);
  }
  saveDB(db);
  res.json(newBudget);
});

app.delete('/api/budgets/:id', (req, res) => {
  const db = loadDB();
  db.budgets = db.budgets.filter((b: any) => b.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

app.get('/api/events', (req, res) => {
  const db = loadDB();
  res.json(db.events);
});

app.get('/api/events/:slug', (req, res) => {
  const db = loadDB();
  const slug = req.params.slug;
  const event = db.events.find((e: any) => 
    e.slug === slug || 
    e.id === slug ||
    (e.slug && e.slug.toLowerCase() === slug.toLowerCase()) ||
    (e.title && e.title.toLowerCase() === slug.toLowerCase())
  );
  if (!event) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }
  res.json(event);
});

app.post('/api/events', (req, res) => {
  const db = loadDB();
  const newEvent = req.body;
  const index = db.events.findIndex((e: any) => e.id === newEvent.id);
  if (index >= 0) {
    db.events[index] = newEvent;
  } else {
    db.events.unshift(newEvent);
  }
  saveDB(db);
  res.json(newEvent);
});

app.delete('/api/events', (req, res) => {
  const db = loadDB();
  db.events = [];
  saveDB(db);
  res.json({ success: true, message: 'Todos os eventos foram excluídos' });
});

app.delete('/api/events/:id', (req, res) => {
  const db = loadDB();
  db.events = db.events.filter((e: any) => e.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Confirm RSVP from guest link
app.post('/api/events/:slug/rsvp', (req, res) => {
  const db = loadDB();
  const slug = req.params.slug;
  const { guestId, status, confirmedCount, companionNames, dietaryRestrictions, message, phone } = req.body;

  const eventIndex = db.events.findIndex((e: any) => 
    e.slug === slug || 
    e.id === slug ||
    (e.slug && e.slug.toLowerCase() === slug.toLowerCase())
  );
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  const guestIndex = db.events[eventIndex].guests.findIndex((g: any) => g.id === guestId);
  if (guestIndex === -1) {
    return res.status(404).json({ error: 'Convidado não encontrado' });
  }

  db.events[eventIndex].guests[guestIndex] = {
    ...db.events[eventIndex].guests[guestIndex],
    status,
    phone: phone ? String(phone).trim() : db.events[eventIndex].guests[guestIndex].phone,
    confirmedCount: Number(confirmedCount) || (status === 'confirmed' ? 1 : 0),
    companionNames: companionNames || [],
    dietaryRestrictions: dietaryRestrictions || '',
    message: message || '',
    confirmedAt: new Date().toLocaleString('pt-BR'),
  };
  db.events[eventIndex].updatedAt = new Date().toISOString().split('T')[0];

  saveDB(db);
  res.json({
    success: true,
    guest: db.events[eventIndex].guests[guestIndex],
    event: db.events[eventIndex]
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
