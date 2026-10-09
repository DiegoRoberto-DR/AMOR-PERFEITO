import { EventRsvp, Guest } from '../types';

/**
 * Encodes an EventRsvp object into a URL-safe Base64 string
 * for portable cross-device sharing (works on cellphones, Vercel, etc.)
 */
export function encodeEventForUrl(event: EventRsvp): string {
  try {
    const compact = {
      i: event.id,
      s: event.slug,
      t: event.title,
      sb: event.subtitle || '',
      et: event.eventType,
      ed: event.eventDate,
      tm: event.eventTime,
      ln: event.locationName,
      la: event.locationAddress || '',
      lm: event.locationMapsUrl || '',
      dd: event.deadlineDate,
      wm: event.welcomeMessage || '',
      dc: event.dressCode || '',
      bi: event.bannerImage || '',
      g: (event.guests || []).map(g => ({
        i: g.id,
        n: g.name,
        p: g.phone || '',
        c: g.category || 'Geral',
        m: Number(g.maxCompanions) || 0,
        cb: g.maxCompanions > 0,
        s: g.status || 'pending',
        cc: g.confirmedCount || 0,
        cn: g.companionNames || [],
        dr: g.dietaryRestrictions || '',
        msg: g.message || '',
        ca: g.confirmedAt || '',
        tb: g.tableNumber || '',
      }))
    };

    const json = JSON.stringify(compact);
    // Standard UTF-8 safe base64
    const b64 = btoa(unescape(encodeURIComponent(json)));
    // URL-safe replacement: '+' -> '-', '/' -> '_', '=' stripped
    const urlSafe = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return urlSafe;
  } catch (err) {
    console.error('Error encoding event for URL:', err);
    return '';
  }
}

/**
 * Decodes an EventRsvp object from a URL-safe Base64 string
 */
export function decodeEventFromUrl(raw: string): EventRsvp | null {
  try {
    if (!raw) return null;
    let b64 = decodeURIComponent(raw);
    // Restore standard base64 from URL-safe format and replace spaces that URL decoders produce for '+'
    b64 = b64.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
      b64 += '=';
    }

    const json = decodeURIComponent(escape(atob(b64)));
    const c = JSON.parse(json);

    if (!c.t || !c.s) return null;

    const guests: Guest[] = (c.g || []).map((g: any) => ({
      id: g.i || `g-${Date.now()}-${Math.random()}`,
      name: g.n || '',
      phone: g.p || '',
      category: g.c || 'Geral',
      tableNumber: g.tb || '',
      maxCompanions: typeof g.m === 'number' ? g.m : 0,
      canBringCompanions: typeof g.m === 'number' ? g.m > 0 : false,
      status: g.s || 'pending',
      confirmedCount: g.cc || 0,
      companionNames: g.cn || [],
      dietaryRestrictions: g.dr || '',
      message: g.msg || '',
      confirmedAt: g.ca || '',
    }));

    return {
      id: c.i || `event-${Date.now()}`,
      slug: c.s,
      title: c.t,
      subtitle: c.sb || '',
      eventType: c.et || 'Casamento',
      eventDate: c.ed || '',
      eventTime: c.tm || '18:00',
      locationName: c.ln || '',
      locationAddress: c.la || '',
      locationMapsUrl: c.lm || '',
      deadlineDate: c.dd || '',
      welcomeMessage: c.wm || '',
      dressCode: c.dc || '',
      bannerImage: c.bi || '',
      guests,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
  } catch (err) {
    console.error('Error decoding event from URL:', err);
    return null;
  }
}
