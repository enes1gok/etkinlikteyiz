import { EventCategory, CommunityCategory, EventStatus } from '../types';

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return formatShortDate(dateStr);
}

export function formatDaysUntil(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - now.getTime()) / 86400000);

  if (diffDays < 0) return 'Geçti';
  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Yarın';
  return `${diffDays} gün sonra`;
}

export function getEventCategoryLabel(category: EventCategory): string {
  const labels: Record<EventCategory, string> = {
    workshop: 'Atölye',
    seminar: 'Seminer',
    social: 'Sosyal',
    competition: 'Yarışma',
    trip: 'Gezi',
    meetup: 'Buluşma',
    conference: 'Konferans',
    other: 'Diğer',
  };
  return labels[category] ?? 'Diğer';
}

export function getCommunityCategory(category: CommunityCategory): string {
  const labels: Record<CommunityCategory, string> = {
    technology: 'Teknoloji',
    sports: 'Spor',
    arts: 'Sanat',
    science: 'Bilim',
    social: 'Sosyal',
    music: 'Müzik',
    gaming: 'Oyun',
    other: 'Diğer',
  };
  return labels[category] ?? 'Diğer';
}

export function getEventStatusLabel(status: EventStatus): string {
  const labels: Record<EventStatus, string> = {
    upcoming: 'Yaklaşan',
    ongoing: 'Devam Ediyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
  };
  return labels[status] ?? 'Bilinmiyor';
}

export function getAttendanceRate(checked: number, registered: number): number {
  if (registered === 0) return 0;
  return Math.round((checked / registered) * 100);
}

export function getCapacityRate(registered: number, max: number): number {
  if (max === 0) return 0;
  return Math.round((registered / max) * 100);
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function validateQRCode(qrData: string): { eventId: string | null; valid: boolean } {
  if (!qrData.startsWith('EVENT:')) return { eventId: null, valid: false };
  const parts = qrData.split(':');
  if (parts.length < 3) return { eventId: null, valid: false };
  return { eventId: parts[1], valid: true };
}
