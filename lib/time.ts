// lib/time.ts - Time utilities for Live Ops and Playback

export function toIsoUtc(date: Date): string {
  return date.toISOString();
}

export function fromMinutesAgo(minutes: number): string {
  const now = new Date();
  const past = new Date(now.getTime() - minutes * 60 * 1000);
  return toIsoUtc(past);
}

export function formatRelative(ts: string): string {
  const now = new Date();
  const time = new Date(ts);
  const diffMs = now.getTime() - time.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}

export function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function getLast24Hours(): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  return {
    start: toIsoUtc(start),
    end: toIsoUtc(end)
  };
}
