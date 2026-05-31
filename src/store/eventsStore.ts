import { create } from 'zustand';
import { Event, Attendee, CheckInResult, WaitlistEntry, EventRating } from '../types';
import { MOCK_EVENTS, MOCK_ATTENDEES, MOCK_WAITLIST, MOCK_RATINGS } from '../utils/mockData';
import { validateQRCode } from '../utils/helpers';

interface EventsState {
  events: Event[];
  attendees: Attendee[];
  selectedEvent: Event | null;
  waitlist: WaitlistEntry[];
  ratings: EventRating[];
  reactions: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;

  fetchEvents: () => Promise<void>;
  selectEvent: (eventId: string) => void;
  clearSelectedEvent: () => void;
  createEvent: (
    event: Omit<Event, 'id' | 'createdAt' | 'qrCodeData' | 'checkedInCount' | 'registeredCount'>
  ) => Promise<Event>;
  registerForEvent: (eventId: string, userId: string) => Promise<boolean>;
  checkInByQR: (qrData: string, eventId: string) => Promise<CheckInResult>;
  getEventAttendees: (eventId: string) => Attendee[];
  getUserEvents: (userId: string) => Event[];
  toggleInterest: (eventId: string, userId: string) => void;
  isInterested: (eventId: string, userId: string) => boolean;
  joinWaitlist: (eventId: string, userId: string, name: string, studentId: string) => Promise<boolean>;
  leaveWaitlist: (eventId: string, userId: string) => void;
  getWaitlistPosition: (eventId: string, userId: string) => number;
  submitRating: (eventId: string, userId: string, rating: number, comment?: string) => Promise<boolean>;
  getUserRating: (eventId: string, userId: string) => EventRating | undefined;
  clearError: () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  attendees: [],
  selectedEvent: null,
  waitlist: [],
  ratings: [],
  reactions: {},
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 600));
      set({
        events: MOCK_EVENTS,
        attendees: MOCK_ATTENDEES,
        waitlist: MOCK_WAITLIST,
        ratings: MOCK_RATINGS,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: 'Etkinlikler yüklenemedi. Lütfen tekrar deneyin.' });
    }
  },

  selectEvent: (eventId) => {
    const event = get().events.find((e) => e.id === eventId) ?? null;
    set({ selectedEvent: event });
  },

  clearSelectedEvent: () => set({ selectedEvent: null }),

  createEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 800));

      const id = `e_${Date.now()}`;
      const newEvent: Event = {
        ...eventData,
        id,
        checkedInCount: 0,
        registeredCount: 0,
        qrCodeData: `EVENT:${id}:${eventData.communityId}:${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        events: [newEvent, ...state.events],
        isLoading: false,
      }));

      return newEvent;
    } catch {
      set({ isLoading: false, error: 'Etkinlik oluşturulamadı.' });
      throw new Error('Etkinlik oluşturulamadı.');
    }
  },

  registerForEvent: async (eventId, _userId) => {
    try {
      await new Promise((r) => setTimeout(r, 500));

      set((state) => ({
        events: state.events.map((e) =>
          e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
        ),
      }));

      return true;
    } catch {
      return false;
    }
  },

  checkInByQR: async (qrData, eventId): Promise<CheckInResult> => {
    try {
      await new Promise((r) => setTimeout(r, 400));

      const { eventId: scannedEventId, valid } = validateQRCode(qrData);

      if (!valid) {
        return { success: false, message: 'Geçersiz QR kod formatı.' };
      }

      if (scannedEventId !== eventId) {
        return { success: false, message: 'Bu QR kod bu etkinliğe ait değil.' };
      }

      const attendees = get().attendees;
      const found = attendees.find((a) => a.eventId === eventId && !a.checkedIn);

      if (!found) {
        return { success: false, message: 'Katılımcı bulunamadı veya zaten giriş yapıldı.' };
      }

      const updatedAttendee: Attendee = {
        ...found,
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
      };

      set((state) => ({
        attendees: state.attendees.map((a) => (a.id === found.id ? updatedAttendee : a)),
        events: state.events.map((e) =>
          e.id === eventId ? { ...e, checkedInCount: e.checkedInCount + 1 } : e
        ),
      }));

      return {
        success: true,
        message: `${found.name} başarıyla giriş yaptı!`,
        attendee: updatedAttendee,
      };
    } catch {
      return { success: false, message: 'Giriş işlemi sırasında bir hata oluştu.' };
    }
  },

  getEventAttendees: (eventId) => {
    return get().attendees.filter((a) => a.eventId === eventId);
  },

  getUserEvents: (userId) => {
    const userAttendances = get().attendees.filter((a) => a.userId === userId);
    const eventIds = new Set(userAttendances.map((a) => a.eventId));
    return get().events.filter((e) => eventIds.has(e.id));
  },

  toggleInterest: (eventId, userId) => {
    set((state) => {
      const current = state.reactions[eventId] ?? [];
      const isAlreadyInterested = current.includes(userId);
      const updated = isAlreadyInterested
        ? current.filter((id) => id !== userId)
        : [...current, userId];

      const interestedDelta = isAlreadyInterested ? -1 : 1;

      return {
        reactions: { ...state.reactions, [eventId]: updated },
        events: state.events.map((e) =>
          e.id === eventId
            ? { ...e, interestedCount: Math.max(0, (e.interestedCount ?? 0) + interestedDelta) }
            : e
        ),
      };
    });
  },

  isInterested: (eventId, userId) => {
    return (get().reactions[eventId] ?? []).includes(userId);
  },

  joinWaitlist: async (eventId, userId, name, studentId) => {
    try {
      await new Promise((r) => setTimeout(r, 400));

      const alreadyOnWaitlist = get().waitlist.some(
        (w) => w.eventId === eventId && w.userId === userId
      );
      if (alreadyOnWaitlist) return false;

      const entry: WaitlistEntry = {
        id: `w_${Date.now()}`,
        eventId,
        userId,
        name,
        studentId,
        joinedAt: new Date().toISOString(),
      };

      set((state) => ({
        waitlist: [...state.waitlist, entry],
        events: state.events.map((e) =>
          e.id === eventId ? { ...e, waitlistCount: (e.waitlistCount ?? 0) + 1 } : e
        ),
      }));

      return true;
    } catch {
      return false;
    }
  },

  leaveWaitlist: (eventId, userId) => {
    set((state) => ({
      waitlist: state.waitlist.filter((w) => !(w.eventId === eventId && w.userId === userId)),
      events: state.events.map((e) =>
        e.id === eventId
          ? { ...e, waitlistCount: Math.max(0, (e.waitlistCount ?? 1) - 1) }
          : e
      ),
    }));
  },

  getWaitlistPosition: (eventId, userId) => {
    const list = get().waitlist.filter((w) => w.eventId === eventId);
    const idx = list.findIndex((w) => w.userId === userId);
    return idx === -1 ? -1 : idx + 1;
  },

  submitRating: async (eventId, userId, rating, comment) => {
    try {
      await new Promise((r) => setTimeout(r, 400));

      const existing = get().ratings.find((r) => r.eventId === eventId && r.userId === userId);
      if (existing) return false;

      const newRating: EventRating = {
        id: `r_${Date.now()}`,
        eventId,
        userId,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        const eventRatings = [...state.ratings.filter((r) => r.eventId === eventId), newRating];
        const avg = eventRatings.reduce((s, r) => s + r.rating, 0) / eventRatings.length;

        return {
          ratings: [...state.ratings, newRating],
          events: state.events.map((e) =>
            e.id === eventId
              ? { ...e, averageRating: Math.round(avg * 10) / 10, ratingCount: eventRatings.length }
              : e
          ),
        };
      });

      return true;
    } catch {
      return false;
    }
  },

  getUserRating: (eventId, userId) => {
    return get().ratings.find((r) => r.eventId === eventId && r.userId === userId);
  },

  clearError: () => set({ error: null }),
}));
