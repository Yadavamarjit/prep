import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export const getCalendarDays = (date: Date) => {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
};

export const formatMonth = (date: Date) => format(date, 'MMMM yyyy');
export const formatDate = (date: Date) => format(date, 'PPP');
export const formatTime = (date: Date) => format(date, 'p');

export { addMonths, subMonths, isSameMonth, isSameDay };
