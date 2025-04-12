export function dateNow(): string {
    return formatDateFull(new Date());
}

export function formatDateFull(datetime: Date | string): string {
    const date = typeof datetime === 'string' ? new Date(datetime) : datetime;
  
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(',', ' at');
}