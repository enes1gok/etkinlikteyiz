import { create } from 'zustand';
import { Event, Attendee, CheckInResult } from '../types';
import { MOCK_EVENTS, MOCK_ATTENDEES } from '../utils/mockData';
import { validateQRCode } from '../utils/helpers';

interface EventsState {
  events: Event[];
  attendees: Attendee[];
  selectedEvent: Event | null;
  isLoading: boolean;

  fetchEvents: () => Promise<void>;
  selectEvent: (eventId: string) => void;
  clearSelectedEvent: () => void;
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'qrCodeData' | 'checkedInCount' | 'registeredCount'>) => Promise<Event>;
  registerForEvent: (eventId: string, userId: string) => Promise<boolean>;
  checkInByQR: (qrData: string, eventId: string) => Promise<CheckInResult>;
  getEventAttendees: (eventId: string) => Attendee[];
  getUserEvents: (userId: string) => Event[];
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  attendees: [],
  selectedEvent: null,
  isLoading: false,

  fetchEvents: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 600));
    set({ events: MOCK_EVENTS, attendees: MOCK_ATTENDEES, isLoading: false });
  },

  selectEvent: (eventId) => {
    const event = get().events.find((e) => e.id === eventId) ?? null;
    set({ selectedEvent: event });
  },

  clearSelectedEvent: () => set({ selectedEvent: null }),

  createEvent: async (eventData) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));

    const newEvent: Event = {
      ...eventData,
      id: `e_${Date.now()}`,
      checkedInCount: 0,
      registeredCount: 0,
      qrCodeData: `EVENT:e_${Date.now()}:${eventData.communityId}:${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      events: [newEvent, ...state.events],
      isLoading: false,
    }));

    return newEvent;
  },

  registerForEvent: async (eventId, _userId) => {
    await new Promise((r) => setTimeout(r, 500));

    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
      ),
    }));

    return true;
  },

  checkInByQR: async (qrData, eventId): Promise<CheckInResult> => {
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

    return { success: true, message: `${found.name} başarıyla giriş yaptı!`, attendee: updatedAttendee };
  },

  getEventAttendees: (eventId) => {
    return get().attendees.filter((a) => a.eventId === eventId);
  },

  getUserEvents: (userId) => {
    const user = get().attendees.filter((a) => a.userId === userId);
    const eventIds = new Set(user.map((a) => a.eventId));
    return get().events.filter((e) => eventIds.has(e.id));
  },
}));
