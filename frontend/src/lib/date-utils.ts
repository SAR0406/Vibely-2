import { format, formatDistanceToNow, isYesterday, isToday, isThisWeek, subDays, isSameDay as isSameDayOriginal } from 'date-fns';

export function formatMessageTime(dateString: string | undefined | null) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as is if already formatted or invalid

    if (isToday(date)) {
        return format(date, 'h:mm a');
    }

    if (isYesterday(date)) {
        return 'Yesterday';
    }

    if (isThisWeek(date)) {
        return format(date, 'EEEE'); // e.g., Monday
    }

    return format(date, 'MMM d, yyyy'); // e.g., Jan 10, 2024
}

export function formatDistance(dateString: string | undefined | null) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const distance = formatDistanceToNow(date, { addSuffix: true });
    return distance.replace('about ', '');
}

export function isSameDay(date1: string | Date, date2: string | Date) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
    return isSameDayOriginal(d1, d2);
}

export function formatMessageDate(dateString: string | Date | undefined | null) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);

    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE'); // Monday
    return format(date, 'MMMM d, yyyy'); // January 10, 2024
}
