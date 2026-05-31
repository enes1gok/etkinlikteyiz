export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  avatar?: string;
  role: 'admin' | 'organizer' | 'member';
  communityId: string;
  joinedAt: string;
  eventsAttended: number;
  eventsRegistered: string[];
}

export interface Community {
  id: string;
  name: string;
  shortName: string;
  description: string;
  logo?: string;
  memberCount: number;
  eventCount: number;
  category: CommunityCategory;
  university: string;
  foundedAt: string;
}

export type CommunityCategory =
  | 'technology'
  | 'sports'
  | 'arts'
  | 'science'
  | 'social'
  | 'music'
  | 'gaming'
  | 'other';

export interface Event {
  id: string;
  title: string;
  description: string;
  communityId: string;
  communityName: string;
  organizerId: string;
  category: EventCategory;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  locationDetail?: string;
  maxCapacity: number;
  registeredCount: number;
  checkedInCount: number;
  status: EventStatus;
  coverImage?: string;
  tags: string[];
  isRegistrationOpen: boolean;
  qrCodeData: string;
  createdAt: string;
}

export type EventCategory =
  | 'workshop'
  | 'seminar'
  | 'social'
  | 'competition'
  | 'trip'
  | 'meetup'
  | 'conference'
  | 'other';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Attendee {
  id: string;
  userId: string;
  eventId: string;
  name: string;
  studentId: string;
  avatar?: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  eventId?: string;
  read: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'event_reminder'
  | 'event_created'
  | 'event_cancelled'
  | 'event_updated'
  | 'check_in_success'
  | 'general';

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalAttendees: number;
  averageAttendance: number;
  topEvent?: Event;
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  events: number;
  attendees: number;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  attendee?: Attendee;
}
